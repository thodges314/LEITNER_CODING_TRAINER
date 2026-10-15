import ts from 'typescript';

/**
 * Transforms JavaScript / TypeScript source code to inject timeout guards
 * into all loops (`while`, `for`, `for..of`, `for..in`, `do..while`).
 *
 * Each loop receives a start timestamp and an iteration counter. Every 1024
 * iterations (a single bitwise check), it compares `Date.now() - startTime > timeoutMs`.
 * If exceeded, it throws an Error, safely breaking out of synchronous infinite loops
 * on single-threaded execution environments without freezing the browser UI.
 */
export function injectLoopGuards(sourceCode: string, timeoutMs = 3000): string {
  try {
    const sourceFile = ts.createSourceFile('user_code.ts', sourceCode, ts.ScriptTarget.ES2022, true);
    let loopCount = 0;

    const transformer = (context: ts.TransformationContext) => {
      return (rootNode: ts.SourceFile) => {
        function visit(node: ts.Node): ts.Node | ts.Node[] {
          if (
            ts.isWhileStatement(node) ||
            ts.isForStatement(node) ||
            ts.isForInStatement(node) ||
            ts.isForOfStatement(node) ||
            ts.isDoStatement(node)
          ) {
            const loopId = ++loopCount;
            const varStart = ts.factory.createIdentifier(`__lp_start_${loopId}`);
            const varIter = ts.factory.createIdentifier(`__lp_iter_${loopId}`);

            // let __lp_start_1 = Date.now(), __lp_iter_1 = 0;
            const initStatement = ts.factory.createVariableStatement(
              undefined,
              ts.factory.createVariableDeclarationList(
                [
                  ts.factory.createVariableDeclaration(
                    varStart,
                    undefined,
                    undefined,
                    ts.factory.createCallExpression(
                      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('Date'), 'now'),
                      undefined,
                      []
                    )
                  ),
                  ts.factory.createVariableDeclaration(
                    varIter,
                    undefined,
                    undefined,
                    ts.factory.createNumericLiteral(0)
                  ),
                ],
                ts.NodeFlags.Let
              )
            );

            // if ((++__lp_iter_1 & 1023) === 0 && Date.now() - __lp_start_1 > timeoutMs)
            //   throw new Error(`Execution timed out after ${timeoutMs}ms (infinite loop detected)`);
            const guardCondition = ts.factory.createBinaryExpression(
              ts.factory.createBinaryExpression(
                ts.factory.createParenthesizedExpression(
                  ts.factory.createBinaryExpression(
                    ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.PlusPlusToken, varIter),
                    ts.SyntaxKind.AmpersandToken,
                    ts.factory.createNumericLiteral(1023)
                  )
                ),
                ts.SyntaxKind.EqualsEqualsEqualsToken,
                ts.factory.createNumericLiteral(0)
              ),
              ts.SyntaxKind.AmpersandAmpersandToken,
              ts.factory.createBinaryExpression(
                ts.factory.createBinaryExpression(
                  ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('Date'), 'now'),
                    undefined,
                    []
                  ),
                  ts.SyntaxKind.MinusToken,
                  varStart
                ),
                ts.SyntaxKind.GreaterThanToken,
                ts.factory.createNumericLiteral(timeoutMs)
              )
            );

            const guardStatement = ts.factory.createIfStatement(
              guardCondition,
              ts.factory.createThrowStatement(
                ts.factory.createNewExpression(ts.factory.createIdentifier('Error'), undefined, [
                  ts.factory.createStringLiteral(
                    `Execution timed out after ${timeoutMs}ms (infinite loop detected)`
                  ),
                ])
              )
            );

            const visitedBody = ts.visitNode(node.statement, visit) as ts.Statement;
            let newBody: ts.Block;
            if (ts.isBlock(visitedBody)) {
              newBody = ts.factory.updateBlock(visitedBody, [guardStatement, ...visitedBody.statements]);
            } else {
              newBody = ts.factory.createBlock([guardStatement, visitedBody], true);
            }

            let updatedLoop: ts.Statement;
            if (ts.isWhileStatement(node)) {
              updatedLoop = ts.factory.updateWhileStatement(
                node,
                ts.visitNode(node.expression, visit) as ts.Expression,
                newBody
              );
            } else if (ts.isForStatement(node)) {
              updatedLoop = ts.factory.updateForStatement(
                node,
                node.initializer ? (ts.visitNode(node.initializer, visit) as ts.ForInitializer) : undefined,
                node.condition ? (ts.visitNode(node.condition, visit) as ts.Expression) : undefined,
                node.incrementor ? (ts.visitNode(node.incrementor, visit) as ts.Expression) : undefined,
                newBody
              );
            } else if (ts.isForOfStatement(node)) {
              updatedLoop = ts.factory.updateForOfStatement(
                node,
                node.awaitModifier,
                ts.visitNode(node.initializer, visit) as ts.ForInitializer,
                ts.visitNode(node.expression, visit) as ts.Expression,
                newBody
              );
            } else if (ts.isForInStatement(node)) {
              updatedLoop = ts.factory.updateForInStatement(
                node,
                ts.visitNode(node.initializer, visit) as ts.ForInitializer,
                ts.visitNode(node.expression, visit) as ts.Expression,
                newBody
              );
            } else {
              // ts.isDoStatement
              updatedLoop = ts.factory.updateDoStatement(
                node,
                newBody,
                ts.visitNode(node.expression, visit) as ts.Expression
              );
            }

            return [initStatement, updatedLoop];
          }
          return ts.visitEachChild(node, visit, context);
        }
        return ts.visitNode(rootNode, visit) as ts.SourceFile;
      };
    };

    const result = ts.transform(sourceFile, [transformer]);
    const printer = ts.createPrinter();
    return printer.printFile(result.transformed[0]);
  } catch (err) {
    console.warn('Loop guard injection encountered parse error; preserving original code:', err);
    return sourceCode;
  }
}

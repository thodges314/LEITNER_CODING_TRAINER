interface TodoShape { id: number; title: string; completed: boolean }
const compileChecks61 = async () => {
  const todo = await apiGet<TodoShape>('https://jsonplaceholder.typicode.com/todos/1');
  const id: number = todo.id;
  // @ts-expect-error — the result is typed as TodoShape, which has no `nope`
  todo.nope;
  return id;
};
$test.check('Compile time: result is typed as T', typeof compileChecks61 === 'function');

function parseArbitraryClass(className) {
  if (typeof className !== 'string') return null;
  const str = className.trim();
  if (!str) return null;

  const colonIndex = str.lastIndexOf(':');
  let modifier = undefined;
  let remaining = str;

  if (colonIndex !== -1) {
    modifier = str.slice(0, colonIndex);
    remaining = str.slice(colonIndex + 1);
  }

  if (!remaining.endsWith(']')) return null;

  const openBracketIndex = remaining.indexOf('-[');
  if (openBracketIndex === -1) return null;

  const rawPropertyPart = remaining.slice(0, openBracketIndex);
  const rawValue = remaining.slice(openBracketIndex + 2, -1);

  if (!rawPropertyPart || !rawValue) return null;

  let isNegative = false;
  let property = rawPropertyPart;

  if (property.startsWith('-')) {
    isNegative = true;
    property = property.slice(1);
  }

  if (!property) return null;

  let bracketDepth = 0;
  for (let i = 0; i < rawValue.length; i++) {
    if (rawValue[i] === '[') bracketDepth++;
    else if (rawValue[i] === ']') bracketDepth--;
    if (bracketDepth < 0) return null;
  }
  if (bracketDepth !== 0) return null;

  const result = {
    property,
    value: rawValue,
    isNegative,
  };

  if (modifier !== undefined) {
    result.modifier = modifier;
  }

  return result;
}


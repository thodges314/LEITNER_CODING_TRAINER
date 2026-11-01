function fullJustify(words: string[], maxWidth: number): string[] {
  const result: string[] = [];
  let i = 0;

  while (i < words.length) {
    let j = i + 1;
    let lineChars = words[i].length;

    while (j < words.length && lineChars + 1 + words[j].length <= maxWidth) {
      lineChars += 1 + words[j].length;
      j++;
    }

    const numWords = j - i;
    const isLastLine = j === words.length;

    if (numWords === 1 || isLastLine) {
      let line = words.slice(i, j).join(' ');
      line += ' '.repeat(maxWidth - line.length);
      result.push(line);
    } else {
      const totalWordChars = words.slice(i, j).reduce((sum, w) => sum + w.length, 0);
      const totalSpaces = maxWidth - totalWordChars;
      const gaps = numWords - 1;
      const spacePerGap = Math.floor(totalSpaces / gaps);
      const extraSpaces = totalSpaces % gaps;

      let line = '';
      for (let k = 0; k < gaps; k++) {
        const spacesCount = spacePerGap + (k < extraSpaces ? 1 : 0);
        line += words[i + k] + ' '.repeat(spacesCount);
      }
      line += words[j - 1];
      result.push(line);
    }

    i = j;
  }

  return result;
}

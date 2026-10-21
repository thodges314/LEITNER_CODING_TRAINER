function reverseWords(s: string): string {
  return s.split(' ').filter(Boolean).reverse().join(' ');
}

function runLengthEncode(s: string): string {
  let out = '';
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (j < s.length && s[j] === s[i]) j++;
    out += s[i] + (j - i);
    i = j;
  }
  return out;
}

function runLengthDecode(s: string): string {
  return s.replace(/(\D)(\d+)/g, (_, ch, n) => ch.repeat(Number(n)));
}

function isRotation(a: string, b: string): boolean {
  return a.length === b.length && (a + a).includes(b);
}

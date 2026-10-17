function reverseWords(s) {
  return s.split(' ').filter(Boolean).reverse().join(' ');
}

function runLengthEncode(s) {
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

function runLengthDecode(s) {
  return s.replace(/(\D)(\d+)/g, (_, ch, n) => ch.repeat(Number(n)));
}

function isRotation(a, b) {
  return a.length === b.length && (a + a).includes(b);
}

function addInBase(a, b, base) {
  let i = a.length - 1;
  let j = b.length - 1;
  let carry = 0;
  let out = '';
  while (i >= 0 || j >= 0 || carry) {
    const sum = (i >= 0 ? Number(a[i--]) : 0) + (j >= 0 ? Number(b[j--]) : 0) + carry;
    out = (sum % base) + out;
    carry = Math.floor(sum / base);
  }
  return out || '0';
}

function addBinary(a, b) {
  return addInBase(a, b, 2);
}

function addStrings(a, b) {
  return addInBase(a, b, 10);
}

function multiplyStrings(a, b) {
  if (a === '0' || b === '0') return '0';
  const digits = new Array(a.length + b.length).fill(0);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      const sum = Number(a[i]) * Number(b[j]) + digits[i + j + 1];
      digits[i + j + 1] = sum % 10;
      digits[i + j] += Math.floor(sum / 10);
    }
  }
  return digits.join('').replace(/^0+/, '');
}

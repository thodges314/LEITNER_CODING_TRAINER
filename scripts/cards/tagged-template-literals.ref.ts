function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHtml(strings: TemplateStringsArray, ...values: any[]): string {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += escapeHtml(values[i]) + strings[i + 1];
  }
  return result;
}

function highlight(strings: TemplateStringsArray, ...values: any[]): string {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += '<mark>' + String(values[i]) + '</mark>' + strings[i + 1];
  }
  return result;
}

function getRawString(strings: TemplateStringsArray, ...values: any[]): string {
  let result = strings.raw[0];
  for (let i = 0; i < values.length; i++) {
    result += String(values[i]) + strings.raw[i + 1];
  }
  return result;
}

function formatNumber(n, decimals = 0) {
  const [int, frac] = Math.abs(n).toFixed(decimals).split('.');
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '-' : '') + withCommas + (frac ? '.' + frac : '');
}

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${parseFloat((bytes / 1024 ** i).toFixed(decimals))} ${units[i]}`;
}

function timeAgo(timestampMs, nowMs = Date.now()) {
  const seconds = Math.round((nowMs - timestampMs) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';
  const units = [
    ['year', 365 * 86400],
    ['month', 30 * 86400],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [name, size] of units) {
    if (abs >= size) {
      const n = Math.round(abs / size);
      const label = `${n} ${name}${n === 1 ? '' : 's'}`;
      return seconds > 0 ? `${label} ago` : `in ${label}`;
    }
  }
  return 'just now';
}

function truncate(str, max) {
  return str.length <= max ? str : str.slice(0, Math.max(0, max - 1)) + '…';
}

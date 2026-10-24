function formatNumber(n: number, decimals: number = 0): string {
  const [int, frac] = Math.abs(n).toFixed(decimals).split('.');
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '-' : '') + withCommas + (frac ? '.' + frac : '');
}

function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${parseFloat((bytes / 1024 ** i).toFixed(decimals))} ${units[i]}`;
}

function timeAgo(timestampMs: number, nowMs: number = Date.now()): string {
  const seconds = Math.round((nowMs - timestampMs) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';
  const units: [string, number][] = [
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

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, Math.max(0, max - 1)) + '…';
}

function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const words = new Set<string>(wordList);
  if (!words.has(endWord)) return 0;
  let queue: string[] = [beginWord];
  const seen = new Set<string>([beginWord]);
  let steps = 1;
  while (queue.length) {
    const next: string[] = [];
    for (const word of queue) {
      if (word === endWord) return steps;
      for (let i = 0; i < word.length; i++) {
        for (let code = 97; code <= 122; code++) {
          const candidate = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
          if (words.has(candidate) && !seen.has(candidate)) {
            seen.add(candidate);
            next.push(candidate);
          }
        }
      }
    }
    queue = next;
    steps++;
  }
  return 0;
}

function minMutation(start: string, end: string, bank: string[]): number {
  const valid = new Set<string>(bank);
  if (start === end) return 0;
  if (!valid.has(end)) return -1;
  let queue: string[] = [start];
  const seen = new Set<string>([start]);
  let steps = 0;
  while (queue.length) {
    const next: string[] = [];
    steps++;
    for (const gene of queue) {
      for (let i = 0; i < gene.length; i++) {
        for (const ch of 'ACGT') {
          const candidate = gene.slice(0, i) + ch + gene.slice(i + 1);
          if (!valid.has(candidate) || seen.has(candidate)) continue;
          if (candidate === end) return steps;
          seen.add(candidate);
          next.push(candidate);
        }
      }
    }
    queue = next;
  }
  return -1;
}

function openLock(deadends: string[], target: string): number {
  const dead = new Set<string>(deadends);
  if (dead.has('0000')) return -1;
  if (target === '0000') return 0;
  let queue: string[] = ['0000'];
  const seen = new Set<string>(['0000']);
  let moves = 0;
  while (queue.length) {
    const next: string[] = [];
    moves++;
    for (const state of queue) {
      for (let i = 0; i < 4; i++) {
        const digit = Number(state[i]);
        for (const delta of [1, 9]) {
          const candidate = state.slice(0, i) + ((digit + delta) % 10) + state.slice(i + 1);
          if (dead.has(candidate) || seen.has(candidate)) continue;
          if (candidate === target) return moves;
          seen.add(candidate);
          next.push(candidate);
        }
      }
    }
    queue = next;
  }
  return -1;
}

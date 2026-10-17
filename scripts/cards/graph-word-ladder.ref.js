function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  let queue = [beginWord];
  const seen = new Set([beginWord]);
  let steps = 1;
  while (queue.length) {
    const next = [];
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

function minMutation(start, end, bank) {
  const valid = new Set(bank);
  if (start === end) return 0;
  if (!valid.has(end)) return -1;
  let queue = [start];
  const seen = new Set([start]);
  let steps = 0;
  while (queue.length) {
    const next = [];
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

function openLock(deadends, target) {
  const dead = new Set(deadends);
  if (dead.has('0000')) return -1;
  if (target === '0000') return 0;
  let queue = ['0000'];
  const seen = new Set(['0000']);
  let moves = 0;
  while (queue.length) {
    const next = [];
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

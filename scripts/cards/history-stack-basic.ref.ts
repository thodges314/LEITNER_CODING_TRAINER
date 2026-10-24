interface HistoryManager<T> {
  getPresent(): T;
  canUndo(): boolean;
  canRedo(): boolean;
  push(value: T): T;
  undo(): T;
  redo(): T;
}

function createHistory<T>(initial: T): HistoryManager<T> {
  const past: T[] = [];
  let present: T = initial;
  let future: T[] = [];

  return {
    getPresent(): T {
      return present;
    },
    canUndo(): boolean {
      return past.length > 0;
    },
    canRedo(): boolean {
      return future.length > 0;
    },
    push(value: T): T {
      if (Object.is(value, present)) return present;
      past.push(present);
      present = value;
      future = [];
      return present;
    },
    undo(): T {
      if (past.length > 0) {
        future.push(present);
        present = past.pop()!;
      }
      return present;
    },
    redo(): T {
      if (future.length > 0) {
        past.push(present);
        present = future.pop()!;
      }
      return present;
    },
  };
}

function createHistory(initial) {
  const past = [];
  let present = initial;
  let future = [];

  return {
    getPresent() {
      return present;
    },
    canUndo() {
      return past.length > 0;
    },
    canRedo() {
      return future.length > 0;
    },
    push(value) {
      if (Object.is(value, present)) return present;
      past.push(present);
      present = value;
      future = [];
      return present;
    },
    undo() {
      if (past.length > 0) {
        future.push(present);
        present = past.pop();
      }
      return present;
    },
    redo() {
      if (future.length > 0) {
        past.push(present);
        present = future.pop();
      }
      return present;
    },
  };
}

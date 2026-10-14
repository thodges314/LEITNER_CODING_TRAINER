function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO': {
      const id = state.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      return [...state, { id, text: action.payload, done: false }];
    }
    case 'TOGGLE_TODO':
      return state.map((t) => (t.id === action.payload ? { ...t, done: !t.done } : t));
    case 'REMOVE_TODO':
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
}

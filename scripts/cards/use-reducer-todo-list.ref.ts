interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

type TodoAction =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'REMOVE_TODO'; payload: number }
  | { type: string; payload?: unknown };

function todoReducer(state: TodoItem[], action: TodoAction): TodoItem[] {
  switch (action.type) {
    case 'ADD_TODO': {
      const id = state.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      return [...state, { id, text: action.payload as string, done: false }];
    }
    case 'TOGGLE_TODO':
      return state.map((t) => (t.id === action.payload ? { ...t, done: !t.done } : t));
    case 'REMOVE_TODO':
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
}

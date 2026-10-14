const initialState = { todos: [], filter: 'all' };

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, todos: [...state.todos, { id: action.id, text: action.text, done: false }] };
    case 'TOGGLE':
      return { ...state, todos: state.todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)) };
    case 'EDIT':
      return { ...state, todos: state.todos.map((t) => (t.id === action.id ? { ...t, text: action.text } : t)) };
    case 'DELETE':
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    default:
      return state;
  }
}

function selectVisibleTodos(state) {
  if (state.filter === 'active') return state.todos.filter((t) => !t.done);
  if (state.filter === 'done') return state.todos.filter((t) => t.done);
  return state.todos;
}

function selectCounts(state) {
  const done = state.todos.filter((t) => t.done).length;
  return { total: state.todos.length, active: state.todos.length - done, done };
}

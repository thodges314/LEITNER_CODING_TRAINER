interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type TodoFilter = 'all' | 'active' | 'done';

interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
}

type TodoAction =
  | { type: 'ADD'; id: number; text: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'EDIT'; id: number; text: string }
  | { type: 'DELETE'; id: number }
  | { type: 'SET_FILTER'; filter: TodoFilter }
  | { type: string; id?: number; text?: string; filter?: TodoFilter };

interface TodoCounts {
  total: number;
  active: number;
  done: number;
}

const initialState: TodoState = { todos: [], filter: 'all' };

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return { ...state, todos: [...state.todos, { id: action.id as number, text: action.text as string, done: false }] };
    case 'TOGGLE':
      return { ...state, todos: state.todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)) };
    case 'EDIT':
      return { ...state, todos: state.todos.map((t) => (t.id === action.id ? { ...t, text: action.text as string } : t)) };
    case 'DELETE':
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };
    case 'SET_FILTER':
      return { ...state, filter: action.filter as TodoFilter };
    default:
      return state;
  }
}

function selectVisibleTodos(state: TodoState): Todo[] {
  if (state.filter === 'active') return state.todos.filter((t) => !t.done);
  if (state.filter === 'done') return state.todos.filter((t) => t.done);
  return state.todos;
}

function selectCounts(state: TodoState): TodoCounts {
  const done = state.todos.filter((t) => t.done).length;
  return { total: state.todos.length, active: state.todos.length - done, done };
}

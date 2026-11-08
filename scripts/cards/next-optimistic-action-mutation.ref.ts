interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  isPending?: boolean;
}

interface TodoListOptimisticProps {
  initialTodos: TodoItem[];
  onToggleAction: (todoId: string, completed: boolean) => Promise<void>;
}

const TodoListOptimistic = ({
  initialTodos,
  onToggleAction,
}: TodoListOptimisticProps): React.ReactElement => {
  const [todos, setTodos] = React.useState<TodoItem[]>(initialTodos || []);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [optimisticTodos, setOptimisticTodos] = (React as unknown as {
    useOptimistic: <T, P>(
      passthrough: T,
      reducer: (state: T, update: P) => T
    ) => [T, (update: P) => void];
  }).useOptimistic(
    todos,
    (currentTodos: TodoItem[], update: { id: string; completed: boolean }): TodoItem[] =>
      currentTodos.map((t) =>
        t.id === update.id
          ? { ...t, completed: update.completed, isPending: true }
          : t
      )
  );

  const handleToggle = (id: string, currentCompleted: boolean) => {
    setErrorMessage(null);
    const nextCompleted = !currentCompleted;

    React.startTransition(async () => {
      setOptimisticTodos({ id, completed: nextCompleted });
      try {
        await onToggleAction(id, nextCompleted);
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: nextCompleted } : t
          )
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update todo';
        setErrorMessage(message);
      }
    });
  };

  return (
    <div data-testid="optimistic-todo-container">
      {errorMessage ? (
        <div data-testid="optimistic-error" role="alert">
          {errorMessage}
        </div>
      ) : null}
      <ul data-testid="todo-list">
        {optimisticTodos.map((todo) => (
          <li key={todo.id} data-testid={`todo-item-${todo.id}`}>
            <button
              type="button"
              data-testid={`todo-toggle-${todo.id}`}
              aria-pressed={todo.completed}
              onClick={() => handleToggle(todo.id, todo.completed)}
            >
              {todo.completed ? 'Completed' : 'Pending'}
            </button>
            <span data-testid={`todo-title-${todo.id}`}>{todo.title}</span>
            {todo.isPending ? (
              <span data-testid="pending-badge">Saving...</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

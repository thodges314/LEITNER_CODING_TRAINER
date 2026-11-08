function Preview() {
  const props = usePreviewProps({
    simulateFailure: false,
    latencyMs: 600,
  });

  const initialItems = [
    { id: '1', title: 'Compile Next.js App Router static pages', completed: true },
    { id: '2', title: 'Verify React 19 useOptimistic rollback flow', completed: false },
    { id: '3', title: 'Deploy Partial Prerendering microservices', completed: false },
  ];

  const handleAction = async (id, nextState) => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (props.simulateFailure) {
          reject(new Error('Server Action failed: Database timeout'));
        } else {
          resolve();
        }
      }, props.latencyMs);
    });
    if (typeof log === 'function') log('todoToggled', { id, nextState });
  };

  return (
    <div className="p-6 bg-slate-900 min-h-[280px] flex items-center justify-center rounded-lg">
      <div className="w-full max-w-md bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center justify-between">
          <span>Sprint Tasks</span>
          <span className="text-xs text-blue-400 font-mono">React 19 Optimistic</span>
        </h3>
        <TodoListOptimistic
          key={`${props.simulateFailure}`}
          initialTodos={initialItems}
          onToggleAction={handleAction}
        />
      </div>
    </div>
  );
}

<Preview />


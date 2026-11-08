await (async () => {
  const { render, fire, wait, act } = $dom;
  const Comp = typeof TodoListOptimistic === 'function'
    ? TodoListOptimistic
    : (typeof solution === 'object' && typeof solution?.TodoListOptimistic === 'function' ? solution.TodoListOptimistic : null);

  const case1 = 'Renders initial todo items with correct completed status and button text';
  const case2 = 'Applies optimistic state immediately with pending badge during transition';
  const case3 = 'Commits successful state when Server Action resolves';
  const case4 = 'Automatically rolls back optimistic update and renders error message when Server Action rejects';

  if (!Comp) {
    $test.check(case1, false, { error: 'TodoListOptimistic is not defined' });
    $test.check(case2, false, { error: 'TodoListOptimistic is not defined' });
    $test.check(case3, false, { error: 'TodoListOptimistic is not defined' });
    $test.check(case4, false, { error: 'TodoListOptimistic is not defined' });
    return;
  }

  const initialList = [
    { id: '1', title: 'Write tests', completed: false },
    { id: '2', title: 'Deploy release', completed: true },
  ];

  // 1. Initial render
  {
    const { container, unmount } = render(
      React.createElement(Comp, {
        initialTodos: initialList,
        onToggleAction: async () => {},
      })
    );

    const btn1 = container.querySelector('[data-testid="todo-toggle-1"]');
    const btn2 = container.querySelector('[data-testid="todo-toggle-2"]');
    const title1 = container.querySelector('[data-testid="todo-title-1"]');

    const passed = btn1 !== null &&
      btn2 !== null &&
      btn1.textContent.trim() === 'Pending' &&
      btn1.getAttribute('aria-pressed') === 'false' &&
      btn2.textContent.trim() === 'Completed' &&
      btn2.getAttribute('aria-pressed') === 'true' &&
      title1?.textContent?.trim() === 'Write tests';

    $test.check(case1, Boolean(passed), {
      btn1Text: btn1?.textContent,
      btn2Text: btn2?.textContent,
    });
    unmount();
  }

  // 2 & 3. Optimistic update and success commit
  {
    const calls: Array<{ id: string; next: boolean; resolve: () => void; reject: (err: Error) => void }> = [];
    const onToggle = function () {
      const id = String(arguments[0]);
      const next = Boolean(arguments[1]);
      return new Promise<void>((resolve, reject) => {
        calls.push({ id, next, resolve: () => resolve(), reject });
      });
    };

    const { container, unmount } = render(
      React.createElement(Comp, {
        initialTodos: initialList,
        onToggleAction: onToggle,
      })
    );

    const btn1 = container.querySelector('[data-testid="todo-toggle-1"]');
    await act(async () => {
      fire.click(btn1);
    });

    // Check optimistic immediate update
    const btn1Optimistic = container.querySelector('[data-testid="todo-toggle-1"]');
    const badge = container.querySelector('[data-testid="pending-badge"]');
    const optimisticPassed = btn1Optimistic !== null &&
      btn1Optimistic.textContent.trim() === 'Completed' &&
      badge !== null &&
      calls.length === 1;

    $test.check(case2, Boolean(optimisticPassed), {
      btn1Optimistic: btn1Optimistic?.textContent,
      hasPendingBadge: !!badge,
    });

    // Resolve action and verify commit
    await act(async () => {
      calls[0].resolve();
      await wait(50);
    });

    const btn1Committed = container.querySelector('[data-testid="todo-toggle-1"]');
    const badgeAfter = container.querySelector('[data-testid="pending-badge"]');
    const commitPassed = btn1Committed !== null &&
      btn1Committed.textContent.trim() === 'Completed' &&
      badgeAfter === null;

    $test.check(case3, Boolean(commitPassed), {
      btn1Committed: btn1Committed?.textContent,
      badgeAfter: !!badgeAfter,
    });
    unmount();
  }

  // 4. Automatic rollback on Server Action rejection
  {
    const calls: Array<{ id: string; next: boolean; resolve: () => void; reject: (err: Error) => void }> = [];
    const onToggleFailing = function () {
      const id = String(arguments[0]);
      const next = Boolean(arguments[1]);
      return new Promise<void>((resolve, reject) => {
        calls.push({ id, next, resolve: () => resolve(), reject });
      });
    };

    const { container, unmount } = render(
      React.createElement(Comp, {
        initialTodos: initialList,
        onToggleAction: onToggleFailing,
      })
    );

    const btn1 = container.querySelector('[data-testid="todo-toggle-1"]');
    await act(async () => {
      fire.click(btn1);
    });

    // Reject the action
    await act(async () => {
      calls[0].reject(new Error('Database unavailable'));
      await wait(50);
    });

    const btn1RolledBack = container.querySelector('[data-testid="todo-toggle-1"]');
    const errorAlert = container.querySelector('[data-testid="optimistic-error"]');

    const rollbackPassed = btn1RolledBack !== null &&
      btn1RolledBack.textContent.trim() === 'Pending' &&
      btn1RolledBack.getAttribute('aria-pressed') === 'false' &&
      errorAlert !== null &&
      errorAlert.textContent.includes('Database unavailable');

    $test.check(case4, Boolean(rollbackPassed), {
      btn1RolledBack: btn1RolledBack?.textContent,
      errorAlert: errorAlert?.textContent,
    });
    unmount();
  }
})();

{
  const { renderHook, act } = $dom;
  const h = renderHook(() => useReducer(todoReducer, []));
  act(() => h.result.current[1]({ type: 'ADD_TODO', payload: 'Practice' }));
  act(() => h.result.current[1]({ type: 'ADD_TODO', payload: 'Rest' }));
  act(() => h.result.current[1]({ type: 'TOGGLE_TODO', payload: 1 }));
  act(() => h.result.current[1]({ type: 'REMOVE_TODO', payload: 2 }));
  $test.check('Works with useReducer inside a component', $test.equal(h.result.current[0], [{ id: 1, text: 'Practice', done: true }]), h.result.current[0]);
  h.unmount();
}

function LikeButton({ initialLiked = false, initialCount = 0, onToggle }) {
  const [state, setState] = useState({ liked: initialLiked, count: initialCount });
  const [error, setError] = useState(false);
  const pending = useRef(false);

  const handleClick = async () => {
    if (pending.current) return; // ignore clicks while a request is in flight
    pending.current = true;
    setError(false);
    const previous = state;
    const nextLiked = !previous.liked;
    setState({ liked: nextLiked, count: previous.count + (nextLiked ? 1 : -1) }); // optimistic update
    try {
      await onToggle(nextLiked);
    } catch {
      setState(previous); // roll back
      setError(true);
    } finally {
      pending.current = false;
    }
  };

  return (
    <div>
      <button aria-pressed={state.liked} onClick={handleClick}>
        {state.liked ? 'Unlike' : 'Like'} ({state.count})
      </button>
      {error && <p role="alert">Could not update</p>}
    </div>
  );
}

interface LikeButtonProps {
  initialLiked?: boolean;
  initialCount?: number;
  onToggle: (nextLiked: boolean) => Promise<unknown>;
}

interface LikeState {
  liked: boolean;
  count: number;
}

function LikeButton({ initialLiked = false, initialCount = 0, onToggle }: LikeButtonProps): JSX.Element {
  const [state, setState] = useState<LikeState>({ liked: initialLiked, count: initialCount });
  const [error, setError] = useState<boolean>(false);
  const pending = useRef<boolean>(false);

  const handleClick = async (): Promise<void> => {
    if (pending.current) return;
    pending.current = true;
    setError(false);
    const previous = state;
    const nextLiked = !previous.liked;
    setState({ liked: nextLiked, count: previous.count + (nextLiked ? 1 : -1) });
    try {
      await onToggle(nextLiked);
    } catch {
      setState(previous);
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

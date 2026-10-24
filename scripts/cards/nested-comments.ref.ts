interface CommentItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  children?: CommentItem[];
}

interface NestedCommentsProps {
  comments: CommentItem[];
  onAddReply?: (parentId: string, text: string) => void;
  maxDepth?: number;
}

interface CommentNodeProps {
  key?: string;
  comment: CommentItem;
  onAddReply?: (parentId: string, text: string) => void;
  maxDepth: number;
  depth: number;
}

function CommentNode({
  comment,
  onAddReply,
  maxDepth,
  depth,
}: CommentNodeProps): JSX.Element {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [replying, setReplying] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');

  const hasChildren = Boolean(comment.children && comment.children.length > 0);
  const canReply = depth < maxDepth;

  const handleSubmitReply = (): void => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    if (typeof onAddReply === 'function') onAddReply(comment.id, trimmed);
    setReplyText('');
    setReplying(false);
  };

  return (
    <li data-comment-id={comment.id}>
      <div>
        <strong data-author>{comment.author}</strong>
        <span data-time>{comment.timestamp}</span>
      </div>
      <p data-text>{comment.text}</p>
      <div>
        {hasChildren && (
          <button
            type="button"
            data-action="toggle-collapse"
            onClick={(): void => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
        {canReply && (
          <button
            type="button"
            data-action="reply"
            onClick={(): void => setReplying(!replying)}
          >
            Reply
          </button>
        )}
      </div>

      {replying && (
        <div>
          <textarea
            data-reply-input
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e: { target: { value: string } }): void =>
              setReplyText(e.target.value)
            }
          />
          <div>
            <button
              type="button"
              data-action="submit-reply"
              onClick={handleSubmitReply}
            >
              Submit
            </button>
            <button
              type="button"
              data-action="cancel-reply"
              onClick={(): void => {
                setReplyText('');
                setReplying(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {hasChildren && !collapsed && (
        <ul>
          {comment.children!.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              onAddReply={onAddReply}
              maxDepth={maxDepth}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function NestedComments({
  comments,
  onAddReply,
  maxDepth = 4,
}: NestedCommentsProps): JSX.Element {
  return (
    <ul>
      {comments.map((comment) => (
        <CommentNode
          key={comment.id}
          comment={comment}
          onAddReply={onAddReply}
          maxDepth={maxDepth}
          depth={1}
        />
      ))}
    </ul>
  );
}

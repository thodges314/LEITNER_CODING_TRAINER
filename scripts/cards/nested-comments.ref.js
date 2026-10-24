function CommentNode({ comment, onAddReply, maxDepth, depth }) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const hasChildren = Boolean(comment.children && comment.children.length > 0);
  const canReply = depth < maxDepth;

  const handleSubmitReply = () => {
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
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
        {canReply && (
          <button
            type="button"
            data-action="reply"
            onClick={() => setReplying(!replying)}
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
            onChange={(e) => setReplyText(e.target.value)}
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
              onClick={() => {
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
          {comment.children.map((child) => (
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

function NestedComments({ comments, onAddReply, maxDepth = 4 }) {
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

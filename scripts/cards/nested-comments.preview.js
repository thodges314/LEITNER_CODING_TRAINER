const sampleThread = [
  {
    id: '1',
    author: 'Sarah Chen',
    timestamp: '3 hours ago',
    text: 'What is the best way to handle optimistic UI updates with nested comments?',
    children: [
      {
        id: '2',
        author: 'Alex River',
        timestamp: '2 hours ago',
        text: 'Assign a client-generated UUID and rollback if the server responds with a 4xx/5xx status.',
        children: [
          {
            id: '3',
            author: 'Elena Gomez',
            timestamp: '45 mins ago',
            text: 'Exactly! Also disable retry loops if the failure is authorization-related.',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    author: 'Jordan Miller',
    timestamp: '1 hour ago',
    text: 'Great article on tree traversals for threaded discussions.',
  },
];

function CommentsDemo() {
  const [comments, setComments] = useState(sampleThread);

  const handleAddReply = (parentId, text) => {
    log('onAddReply')({ parentId, text });
    const addRecursive = (items) => {
      return items.map((item) => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [
              ...(item.children || []),
              {
                id: String(Date.now()),
                author: 'You',
                timestamp: 'Just now',
                text,
              },
            ],
          };
        }
        if (item.children) {
          return { ...item, children: addRecursive(item.children) };
        }
        return item;
      });
    };
    setComments(addRecursive(comments));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '650px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <style>{`
        [data-comments-thread] {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        [data-comment-item] {
          padding: 10px 14px;
          border-left: 3px solid #334155;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0 8px 8px 0;
          margin-top: 8px;
        }
        [data-comment-author] {
          font-weight: 600;
          font-size: 13px;
          color: #38bdf8;
          margin-right: 10px;
        }
        [data-comment-time] {
          font-size: 11px;
          color: #64748b;
        }
        [data-comment-body] {
          margin: 6px 0 10px 0;
          font-size: 13px;
          color: #e2e8f0;
          line-height: 1.4;
        }
        [data-action="toggle-reply"] {
          background: transparent;
          border: 1px solid #334155;
          border-radius: 4px;
          color: #94a3b8;
          font-size: 11px;
          cursor: pointer;
          padding: 3px 8px;
        }
        [data-action="toggle-reply"]:hover {
          color: #38bdf8;
          border-color: #38bdf8;
        }
        [data-reply-form] {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        [data-reply-form] textarea {
          width: 100%;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 6px;
          color: #fff;
          padding: 8px;
          font-size: 12.5px;
          box-sizing: border-box;
        }
        [data-action="submit-reply"] {
          background: #0284c7;
          color: #fff;
          border: none;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11.5px;
          cursor: pointer;
        }
        [data-action="cancel-reply"] {
          background: transparent;
          color: #94a3b8;
          border: 1px solid #334155;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11.5px;
          cursor: pointer;
          margin-left: 8px;
        }
      `}</style>
      <h3 style={{ marginBottom: '16px' }}>Discussion Thread</h3>
      <NestedComments comments={comments} onAddReply={handleAddReply} maxDepth={4} />
    </div>
  );
}

<CommentsDemo />

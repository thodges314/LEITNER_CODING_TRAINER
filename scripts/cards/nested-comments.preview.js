const defaultThread = [
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
        text: 'Assign a client-generated UUID and rollback if the server responds with an error.',
      },
    ],
  },
  {
    id: '3',
    author: 'Jordan Miller',
    timestamp: '1 hour ago',
    text: 'Great article on tree traversals for threaded discussions.',
  },
];

function CommentsDemo() {
  const {
    comments = defaultThread,
    maxDepth = 4,
    onAddReply,
  } = usePreviewProps({
    comments: defaultThread,
    maxDepth: 4,
  });

  const parsedThread = Array.isArray(comments) && comments.length > 0 ? comments : defaultThread;
  const [thread, setThread] = useState(parsedThread);
  useEffect(() => {
    setThread(parsedThread);
  }, [comments]);

  const handleAddReply = (parentId, text) => {
    if (onAddReply) onAddReply(parentId, text);
    log('onAddReply', parentId, text);
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
    setThread(addRecursive(thread));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '650px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h3 style={{ marginBottom: '16px' }}>Discussion Thread</h3>
      <NestedComments
        key={`${maxDepth}-${JSON.stringify(thread)}`}
        comments={thread}
        onAddReply={handleAddReply}
        maxDepth={Number(maxDepth) || 4}
      />
    </div>
  );
}

<CommentsDemo />

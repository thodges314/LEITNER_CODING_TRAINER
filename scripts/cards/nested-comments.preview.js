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
      <h3 style={{ marginBottom: '16px' }}>Discussion Thread</h3>
      <NestedComments comments={comments} onAddReply={handleAddReply} maxDepth={4} />
    </div>
  );
}

<CommentsDemo />

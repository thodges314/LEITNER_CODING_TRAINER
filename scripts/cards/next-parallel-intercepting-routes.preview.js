function Preview() {
  const props = usePreviewProps({
    showModal: false,
    photoId: 'photo_42',
    photoUrl: '/Mountains.jpeg',
  });

  const [modalOpen, setModalOpen] = useState(props.showModal);

  useEffect(() => {
    setModalOpen(props.showModal);
  }, [props.showModal]);

  const modalSlot = modalOpen ? (
    <PhotoModal
      id={props.photoId}
      photoUrl={props.photoUrl}
      onDismiss={() => {
        setModalOpen(false);
        if (typeof log === 'function') log('modalDismissed', props.photoId);
      }}
    />
  ) : null;

  return (
    <div className="p-6 bg-slate-900 min-h-[300px] flex items-center justify-center rounded-lg">
      <FeedLayout modal={modalSlot}>
        <div className="flex flex-col gap-3">
          <p className="text-slate-300 text-sm">Main Feed Content</p>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
            onClick={() => setModalOpen(true)}
          >
            Open Photo Modal ({props.photoId})
          </button>
        </div>
      </FeedLayout>
    </div>
  );
}

<Preview />


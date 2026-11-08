'use client';

interface FeedLayoutProps {
  children: React.ReactNode;
  modal?: React.ReactNode;
}

interface PhotoModalProps {
  id: string;
  photoUrl: string;
  onDismiss?: () => void;
}

function FeedLayout({ children, modal }: FeedLayoutProps): React.ReactElement {
  return (
    <div data-testid="feed-layout">
      <main data-testid="feed-content">{children}</main>
      {modal ? <div data-testid="modal-slot">{modal}</div> : null}
    </div>
  );
}

const PhotoModal = ({
  id,
  photoUrl,
  onDismiss,
}: PhotoModalProps): React.ReactElement => {
  const router = useRouter();

  const handleClose = () => {
    onDismiss?.();
    router.back();
  };

  return (
    <dialog open data-testid="photo-modal" className="modal-dialog">
      <button data-testid="modal-close" onClick={handleClose}>
        Close
      </button>
      <Image
        data-testid="modal-photo"
        src={photoUrl}
        alt={`Photo ${id}`}
        width={600}
        height={400}
      />
    </dialog>
  );
};

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
  return React.createElement(
    'div',
    { 'data-testid': 'feed-layout' },
    React.createElement('main', { 'data-testid': 'feed-content' }, children),
    modal ? React.createElement('div', { 'data-testid': 'modal-slot' }, modal) : null
  );
}

function PhotoModal({ id, photoUrl, onDismiss }: PhotoModalProps): React.ReactElement {
  const router = useRouter();

  const handleClose = () => {
    onDismiss?.();
    router.back();
  };

  return React.createElement(
    'dialog',
    { open: true, 'data-testid': 'photo-modal', className: 'modal-dialog' },
    React.createElement('button', { 'data-testid': 'modal-close', onClick: handleClose }, 'Close'),
    React.createElement('img', { 'data-testid': 'modal-photo', src: photoUrl, alt: `Photo ${id}` })
  );
}

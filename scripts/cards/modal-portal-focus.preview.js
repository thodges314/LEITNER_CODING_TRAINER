function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Accessible modal with portal & focus trap:</div>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          log('openModal')(true);
        }}
        style={{ padding: '6px 12px', width: 'fit-content', borderRadius: '4px', cursor: 'pointer' }}
      >
        Open Modal
      </button>
      <Modal isOpen={open} onClose={() => { setOpen(false); log('onClose')(); }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', color: '#f8fafc', maxWidth: '300px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Modal Dialog</h3>
          <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: '#94a3b8' }}>Focus is trapped inside this modal while open.</p>
          <button
            type="button"
            onClick={() => { setOpen(false); log('onClose')(); }}
            style={{ padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Close Modal
          </button>
        </div>
      </Modal>
    </div>
  );
}

<Demo />

const { render, fire } = $dom;

// 1. Returns null when isOpen is false
{
  const r = render(
    <ModalDialog isOpen={false} onClose={() => {}} title="Test Dialog">
      <p>Body</p>
    </ModalDialog>
  );
  const passed = r.container.innerHTML === '';

  $test.check(
    'Returns null when isOpen is false',
    passed,
    { html: r.container.innerHTML }
  );
  r.unmount();
}

// 2. Renders backdrop overlay with fixed inset-0, z-50, and backdrop-blur-sm when isOpen is true
{
  const r = render(
    <ModalDialog isOpen={true} onClose={() => {}} title="Settings">
      <p>Configure account preferences</p>
    </ModalDialog>
  );
  const backdrop = r.container.firstChild;
  const hasFixed = backdrop !== null && backdrop.classList.contains('fixed');
  const hasInset0 = backdrop !== null && backdrop.classList.contains('inset-0');
  const hasZ50 = backdrop !== null && backdrop.classList.contains('z-50');
  const hasBlur = backdrop !== null && backdrop.classList.contains('backdrop-blur-sm');

  $test.check(
    'Renders backdrop overlay with fixed inset-0, z-50, and backdrop-blur-sm when isOpen is true',
    Boolean(hasFixed && hasInset0 && hasZ50 && hasBlur),
    { hasFixed, hasInset0, hasZ50, hasBlur }
  );
  r.unmount();
}

// 3. Renders semantic dialog with role="dialog", aria-modal="true", and size classes
{
  const r = render(
    <ModalDialog
      isOpen={true}
      onClose={() => {}}
      title="Delete Project"
      size="lg"
      footer={<button type="button">Confirm</button>}
    >
      <p>Are you sure?</p>
    </ModalDialog>
  );
  const dialog = r.container.querySelector('[role="dialog"]');
  const hasDialog = dialog !== null;
  const isAriaModal = dialog?.getAttribute('aria-modal') === 'true';
  const hasTitleId = dialog?.querySelector('#modal-title')?.textContent === 'Delete Project';
  const hasLgSize = dialog?.classList.contains('max-w-lg');
  const hasFooter = r.container.textContent.includes('Confirm');

  $test.check(
    'Renders semantic dialog with role="dialog", aria-modal="true", and size classes',
    Boolean(hasDialog && isAriaModal && hasTitleId && hasLgSize && hasFooter),
    { hasDialog, isAriaModal, hasTitleId, hasLgSize, hasFooter }
  );
  r.unmount();
}

// 4. Invokes onClose when clicking close button or backdrop
{
  let closeCount = 0;
  const r = render(
    <ModalDialog
      isOpen={true}
      onClose={() => {
        closeCount++;
      }}
      title="Dismissible"
    >
      <p>Click backdrop or close</p>
    </ModalDialog>
  );

  const closeBtn = r.container.querySelector('button[aria-label="Close dialog"]');
  if (closeBtn) fire.click(closeBtn);

  const backdrop = r.container.firstChild;
  if (backdrop) fire.click(backdrop);

  const dialog = r.container.querySelector('[role="dialog"]');
  if (dialog) fire.click(dialog);

  $test.check(
    'Invokes onClose when clicking close button or backdrop',
    closeCount === 2,
    { closeCount }
  );
  r.unmount();
}

// 5. Invokes onClose when Escape key is pressed
{
  let escTriggered = false;
  const r = render(
    <ModalDialog
      isOpen={true}
      onClose={() => {
        escTriggered = true;
      }}
      title="Keyboard Modal"
    >
      <p>Press Esc</p>
    </ModalDialog>
  );

  fire.keyDown(window, 'Escape');

  $test.check(
    'Invokes onClose when Escape key is pressed',
    escTriggered,
    { escTriggered }
  );
  r.unmount();
}

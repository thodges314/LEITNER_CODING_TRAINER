(function() {
  const root = document.getElementById('preview-root');
  if (!root) return;

  const markup = typeof html === 'string' ? html : (typeof solution === 'string' ? solution : '');
  root.innerHTML = markup;

  const btn = root.querySelector('button');
  if (btn) {
    btn.addEventListener('click', function() {
      if (typeof log === 'function') log('click', 'Clicked View Detailed Report');
    });
  }
})();

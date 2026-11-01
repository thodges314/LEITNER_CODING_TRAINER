const root = document.getElementById('preview-root');

const tree = {
  type: 'button',
  props: {
    onClick: () => log('click', 'Button clicked'),
    style: {
      padding: '8px 16px',
      borderRadius: '6px',
      background: '#0284c7',
      color: '#ffffff',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
  },
  children: ['Click Me'],
};

render(tree, root);

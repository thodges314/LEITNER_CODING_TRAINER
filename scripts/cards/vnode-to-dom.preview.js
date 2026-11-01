const root = document.getElementById('preview-root');

const tree = {
  type: 'div',
  props: {
    style: {
      padding: '16px',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      maxWidth: '320px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
  },
  children: [
    {
      type: 'div',
      props: {
        style: {
          fontWeight: '600',
          fontSize: '15px',
          color: '#38bdf8',
        },
      },
      children: ['Interactive Card'],
    },
    {
      type: 'div',
      props: {
        style: {
          fontSize: '13px',
          color: '#94a3b8',
          lineHeight: '1.4',
        },
      },
      children: ['Nested DOM nodes constructed from a virtual node tree.'],
    },
    {
      type: 'button',
      props: {
        onClick: () => log('click', 'Button clicked'),
        style: {
          padding: '8px 14px',
          borderRadius: '6px',
          background: '#0284c7',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          alignSelf: 'flex-start',
        },
      },
      children: ['Click Me'],
    },
  ],
};

render(tree, root);

const root = document.getElementById('preview-root');

const tree = {
  type: 'div',
  props: {
    style: {
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
  },
  children: [
    {
      type: 'h3',
      props: { style: { margin: '0', fontSize: '16px', color: '#38bdf8' } },
      children: ['Virtual DOM Tree Explorer'],
    },
    {
      type: 'p',
      props: { style: { margin: '0', fontSize: '13px', color: '#94a3b8' } },
      children: ['Compiled and rendered purely via vanilla DOM without React.'],
    },
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
      children: [
        {
          type: 'span',
          props: { style: { fontSize: '13px' } },
          children: ['Interactive VNode Button: '],
        },
        {
          type: 'button',
          props: {
            onClick: () => log('vnode-button-click', 'Clicked virtual DOM button!'),
            style: {
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
            },
          },
          children: ['Click Me'],
        },
      ],
    },
  ],
};

render(tree, root);

(function() {
  const root = document.getElementById('preview-root');
  if (!root) return;

  let currentProps = Object.assign({
    cardTitle: 'Interactive Card',
    description: 'Nested DOM nodes constructed from a virtual node tree.',
    buttonText: 'Click Me',
    buttonColor: '#0284c7',
  }, typeof window !== 'undefined' ? window.__previewProps : {});

  function renderTree(props) {
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
          children: [props.cardTitle || 'Interactive Card'],
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
          children: [props.description || 'Nested DOM nodes constructed from a virtual node tree.'],
        },
        {
          type: 'button',
          props: {
            onClick: () => {
              if (typeof log === 'function') log('click', `Button clicked: "${props.buttonText || 'Click Me'}"`);
            },
            style: {
              padding: '8px 14px',
              borderRadius: '6px',
              background: props.buttonColor || '#0284c7',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              alignSelf: 'flex-start',
            },
          },
          children: [props.buttonText || 'Click Me'],
        },
      ],
    };

    render(tree, root);
  }

  renderTree(currentProps);

  if (typeof window !== 'undefined' && typeof window.__onPreviewPropsChange === 'function') {
    window.__onPreviewPropsChange(function(newProps) {
      currentProps = Object.assign({}, currentProps, newProps);
      renderTree(currentProps);
    });
  }
})();

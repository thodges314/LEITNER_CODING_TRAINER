const sampleTree = [
  {
    id: 'frontend',
    label: 'Frontend',
    children: [
      { id: 'react', label: 'React' },
      { id: 'typescript', label: 'TypeScript' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    children: [
      { id: 'node', label: 'Node.js' },
      { id: 'postgres', label: 'PostgreSQL' },
    ],
  },
];

function CheckboxTreeNode({ node, getStatus, toggle }) {
  const status = getStatus(node.id);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = status === 'indeterminate';
    }
  }, [status]);

  return (
    <div style={{ marginLeft: '16px', marginY: '4px' }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
        <input
          ref={inputRef}
          type="checkbox"
          checked={status === 'checked'}
          onChange={() => {
            toggle(node.id);
            log('toggle')(node.id);
          }}
        />
        <span style={{ fontSize: '13px' }}>{node.label || node.id}</span>
      </label>
      {node.children && (
        <div>
          {node.children.map((child) => (
            <CheckboxTreeNode key={child.id} node={child} getStatus={getStatus} toggle={toggle} />
          ))}
        </div>
      )}
    </div>
  );
}

function Demo() {
  const { getStatus, toggle } = useCheckboxTree(sampleTree, ['react']);
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>Nested Checkbox Tree:</div>
      {sampleTree.map((node) => (
        <CheckboxTreeNode key={node.id} node={node} getStatus={getStatus} toggle={toggle} />
      ))}
    </div>
  );
}

<Demo />

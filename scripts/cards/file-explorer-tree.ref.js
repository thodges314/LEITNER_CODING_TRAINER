function TreeNode({ node, path, onSelect }) {
  const [open, setOpen] = useState(false);
  const isFolder = Array.isArray(node.children);
  const fullPath = path ? `${path}/${node.name}` : node.name;

  return (
    <li role="treeitem" aria-expanded={isFolder ? open : undefined}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isFolder) setOpen(!open);
          else if (onSelect) onSelect(fullPath);
        }}
      >
        {node.name}
      </button>
      {isFolder && open && (
        <ul role="group">
          {node.children.map((child) => (
            <TreeNode key={child.name} node={child} path={fullPath} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

function FileTree({ nodes, onSelect }) {
  return (
    <ul role="tree">
      {nodes.map((node) => (
        <TreeNode key={node.name} node={node} path="" onSelect={onSelect} />
      ))}
    </ul>
  );
}

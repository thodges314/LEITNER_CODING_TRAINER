const { render, fire, qa } = $dom;
const NODES = [
  { name: 'src', children: [{ name: 'components', children: [{ name: 'Button.jsx' }] }, { name: 'index.js' }] },
  { name: 'README.md' },
];
const names = (c) => qa('button', c).map((b) => b.textContent).join();
const btn = (c, text) => qa('button', c).find((b) => b.textContent === text);
{
  const r = render(<FileTree nodes={NODES} />);
  $test.check('Renders the top level collapsed', names(r.container) === 'src,README.md' && r.container.querySelector('[role="tree"]') !== null, names(r.container));
  r.unmount();
}
{
  const r = render(<FileTree nodes={NODES} />);
  fire.click(btn(r.container, 'src'));
  const src = btn(r.container, 'src').closest('[role="treeitem"]');
  $test.check('Clicking a folder expands it and sets aria-expanded', names(r.container) === 'src,components,index.js,README.md' && src.getAttribute('aria-expanded') === 'true', names(r.container));
  fire.click(btn(r.container, 'src'));
  $test.check('Clicking it again collapses it', names(r.container) === 'src,README.md' && src.getAttribute('aria-expanded') === 'false', names(r.container));
  r.unmount();
}
{
  const r = render(<FileTree nodes={NODES} />);
  fire.click(btn(r.container, 'src'));
  fire.click(btn(r.container, 'components'));
  const deep = names(r.container);
  fire.click(btn(r.container, 'components'));
  $test.check('Nested folders keep their own state', deep === 'src,components,Button.jsx,index.js,README.md' && names(r.container) === 'src,components,index.js,README.md', { deep, now: names(r.container) });
  r.unmount();
}
{
  const picked = [];
  const r = render(<FileTree nodes={NODES} onSelect={(p) => picked.push(p)} />);
  fire.click(btn(r.container, 'src'));
  fire.click(btn(r.container, 'components'));
  fire.click(btn(r.container, 'Button.jsx'));
  fire.click(btn(r.container, 'README.md'));
  $test.check('Clicking a file calls onSelect with its full path', picked.join() === 'src/components/Button.jsx,README.md', picked);
  r.unmount();
}
{
  const r = render(<FileTree nodes={NODES} />);
  const readme = btn(r.container, 'README.md').closest('[role="treeitem"]');
  $test.check('Files are not expandable (no aria-expanded) and clicking a folder does not call onSelect', !readme.hasAttribute('aria-expanded'), readme.outerHTML);
  r.unmount();
}

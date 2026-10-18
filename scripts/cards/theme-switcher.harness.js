const { render, renderError, wait } = $dom;
const KEYS = ['demo-color-scheme', 't-key'];
const reset = () => {
  KEYS.forEach((k) => localStorage.removeItem(k));
  document.documentElement.removeAttribute('data-color-scheme');
};
const attr = () => document.documentElement.getAttribute('data-color-scheme');
let api = null;
function Probe() {
  api = useTheme();
  return <span>{api.theme}</span>;
}
try {
  reset();
  {
    const r = render(<ThemeProvider><Probe /></ThemeProvider>);
    await wait(30);
    $test.check('Defaults to light, sets data-color-scheme and saves it', api.theme === 'light' && attr() === 'light' && localStorage.getItem('demo-color-scheme') === 'light', { theme: api.theme, attr: attr(), saved: localStorage.getItem('demo-color-scheme') });
    r.unmount();
  }
  reset();
  {
    localStorage.setItem('demo-color-scheme', 'dark');
    const r = render(<ThemeProvider><Probe /></ThemeProvider>);
    await wait(30);
    $test.check('Starts from the saved theme when it is valid', api.theme === 'dark' && attr() === 'dark', { theme: api.theme, attr: attr() });
    r.unmount();
  }
  reset();
  {
    localStorage.setItem('demo-color-scheme', 'blue');
    const r = render(<ThemeProvider><Probe /></ThemeProvider>);
    await wait(30);
    $test.check('An invalid saved value ("blue") is ignored in favour of the default', api.theme === 'light' && attr() === 'light', { theme: api.theme, attr: attr() });
    r.unmount();
  }
  reset();
  {
    const r = render(<ThemeProvider><Probe /></ThemeProvider>);
    await wait(30);
    api.toggle();
    await wait(30);
    const dark = { theme: api.theme, attr: attr(), saved: localStorage.getItem('demo-color-scheme') };
    api.toggle();
    await wait(30);
    $test.check('toggle() flips light -> dark -> light and keeps the attribute and storage in sync', dark.theme === 'dark' && dark.attr === 'dark' && dark.saved === 'dark' && api.theme === 'light' && attr() === 'light' && localStorage.getItem('demo-color-scheme') === 'light', { dark, theme: api.theme, attr: attr() });
    r.unmount();
  }
  reset();
  {
    const r = render(<ThemeProvider><Probe /></ThemeProvider>);
    await wait(30);
    api.setTheme('dark');
    await wait(30);
    api.setTheme('purple');
    await wait(30);
    $test.check('setTheme("dark") switches; setTheme("purple") is ignored', api.theme === 'dark' && attr() === 'dark', { theme: api.theme, attr: attr() });
    r.unmount();
  }
  reset();
  {
    const r = render(<ThemeProvider storageKey="t-key" defaultTheme="dark"><Probe /></ThemeProvider>);
    await wait(30);
    $test.check('storageKey and defaultTheme props are honoured (and the default key is left alone)', api.theme === 'dark' && localStorage.getItem('t-key') === 'dark' && localStorage.getItem('demo-color-scheme') === null, { theme: api.theme, custom: localStorage.getItem('t-key'), other: localStorage.getItem('demo-color-scheme') });
    r.unmount();
  }
  reset();
  {
    const err = renderError(<Probe />);
    $test.check('useTheme outside a ThemeProvider throws an error that mentions ThemeProvider', err instanceof Error && /ThemeProvider/.test(err.message), err && err.message);
  }
} finally {
  reset();
}

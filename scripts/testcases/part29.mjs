import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// react-components / react-patterns, batch 6 (B).
export default {
  'tooltip': [
    r('Hidden by default: the child renders, no tooltip, no aria-describedby', '<Tooltip content="Saves the file"><button>Save</button></Tooltip>', "button 'Save' only; no role='tooltip'; no aria-describedby"),
    r('Hovering shows role="tooltip" with the content and links it via aria-describedby', 'mouseover the button', "role='tooltip' text 'Saves the file' with an id; button aria-describedby equals that id"),
    r('Leaving the trigger hides the tooltip and removes aria-describedby', 'mouseover, then mouseout', 'no tooltip; no aria-describedby'),
    r('Keyboard users get it too: focus shows the tooltip, blur hides it', 'focus the button, then blur it', 'tooltip visible after focus; gone after blur'),
    r('Escape dismisses the tooltip; other keys do not', 'focus; press Enter; press Escape', 'still visible after Enter; hidden after Escape'),
    r("The child's own handlers and props are preserved", 'child has onFocus, onMouseEnter, onKeyDown and className="primary"; hover, focus, press "a"', "calls: enter, focus, key; className still 'primary'"),
    r('The content can be any React node', 'content={<b>Bold tip</b>}', "tooltip contains a <b> with text 'Bold tip'"),
  ],
  'theme-switcher': [
    r('Defaults to light, sets data-color-scheme and saves it', '<ThemeProvider><Probe /></ThemeProvider> with empty storage', "theme 'light'; <html data-color-scheme='light'>; localStorage['demo-color-scheme'] = 'light'"),
    r('Starts from the saved theme when it is valid', "localStorage['demo-color-scheme'] = 'dark'", "theme 'dark'; data-color-scheme 'dark'"),
    r('An invalid saved value ("blue") is ignored in favour of the default', "localStorage['demo-color-scheme'] = 'blue'", "theme 'light'; data-color-scheme 'light'"),
    r('toggle() flips light -> dark -> light and keeps the attribute and storage in sync', 'call toggle() twice', "after 1st: 'dark' / attribute 'dark' / saved 'dark'; after 2nd: 'light' / 'light' / 'light'"),
    r('setTheme("dark") switches; setTheme("purple") is ignored', "setTheme('dark'); setTheme('purple')", "theme stays 'dark'; attribute 'dark'"),
    r('storageKey and defaultTheme props are honoured (and the default key is left alone)', '<ThemeProvider storageKey="t-key" defaultTheme="dark">', "theme 'dark'; localStorage['t-key'] = 'dark'; localStorage['demo-color-scheme'] = null"),
    r('useTheme outside a ThemeProvider throws an error that mentions ThemeProvider', '<Probe /> rendered without a provider', "Error whose message matches /ThemeProvider/"),
  ],
};

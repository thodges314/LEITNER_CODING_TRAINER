import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// Accessibility, batch A1: switch, live announcer, roving tabindex toolbar.
export default {
  'switch-toggle-a11y': [
    r("Renders a <button type=\"button\"> with role=\"switch\" and the label as its content", "render <Switch checked={false}>Wi-Fi</Switch>", "<button type=\"button\" role=\"switch\">Wi-Fi</button>"),
    r("aria-checked mirrors the checked prop as the strings \"true\" and \"false\"", "checked={false} and checked={true}", "aria-checked=\"false\" and aria-checked=\"true\""),
    r("Clicking calls onChange with the opposite value", "click when checked={false}; click when checked={true}", "onChange(true); onChange(false)"),
    r("A disabled switch is disabled and ignores clicks", "disabled, then click", "button disabled; onChange not called"),
  ],
  'live-announcer': [
    r("Renders a polite status region and an assertive alert region, both atomic", "render <AnnouncerProvider>\u2026</AnnouncerProvider>", "role=status aria-live=polite aria-atomic=true; role=alert aria-live=assertive aria-atomic=true"),
    r("announce(message) writes to the polite region", "announce('Saved')", "polite region text 'Saved'"),
    r("announce(message, { politeness: 'assertive' }) writes to the alert region and clears the polite one", "announce('Failed', { politeness: 'assertive' })", "alert region 'Failed'; polite region ''"),
    r("Announcing the same message twice changes the raw text so it is read again", "announce('Saved') three times in a row", "'Saved', 'Saved\\u00a0', 'Saved'"),
    r("The regions are visually hidden but never display:none or hidden", "inspect both regions", "position absolute, overflow hidden; no display:none, visibility:hidden or hidden attribute"),
    r("children render, and announce keeps the same identity across renders", "announce twice and re-render", "children still rendered; announce is the same function every render"),
  ],
  'roving-tabindex-toolbar': [
    r("The container is a toolbar with an accessible label", "<Toolbar label=\"Text formatting\" items={[{ id: 'b', label: 'Bold' }, { id: 'i', label: 'Italic' }, { id: 'u', label: 'Underline' }, { id: 'l', label: 'Link' }]} />", "role=toolbar aria-label='Text formatting' with 4 buttons"),
    r("Only the active button is in the tab order: tabIndex 0 for the first by default, -1 for the others", "<Toolbar label=\"Text formatting\" items={items} />", "tabIndex values 0,-1,-1,-1"),
    r("ArrowRight and ArrowLeft move focus and the tab stop to the next and previous button", "focus Bold; ArrowRight; then ArrowRight, ArrowLeft", "focus on Italic; tabIndex values -1,0,-1,-1"),
    r("Arrow keys wrap around at both ends", "focus Bold; ArrowLeft; then ArrowRight", "focus wraps to Link (\u2026,0), then back to Bold (0,\u2026)"),
    r("Home and End jump to the first and last button", "focus Italic; End; Home", "focus on Link (-1,-1,-1,0), then Bold (0,-1,-1,-1)"),
    r("Clicking or focusing a button makes it the tab stop", "click Underline; focus Link", "tabIndex values -1,-1,0,-1 then -1,-1,-1,0"),
  ],
};

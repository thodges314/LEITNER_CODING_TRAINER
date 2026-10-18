import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// Accessibility, batch A2: route focus + skip link, form error summary.
export default {
  'route-focus-and-skip-link': [
    r("The skip link is the first focusable element and points at the main landmark", "render <Layout path=\"/\" title=\"Home\">", "first focusable element: <a href=\"#main-content\">Skip to main content</a>; <main id=\"main-content\"> exists"),
    r("Clicking the skip link moves focus to <main id=\"main-content\" tabindex=\"-1\">", "click the skip link", "document.activeElement is <main>; it has tabindex=\"-1\""),
    r("The document title follows the page title as \"<title> | My App\"", "title 'Home' then rerender with title 'About'", "document.title 'Home | My App' then 'About | My App'"),
    r("The first render does not steal focus", "first render", "document.activeElement is still <body>"),
    r("Changing the path moves focus to the new page heading (h1)", "rerender with path '/about' and title 'About'", "focus is on <h1 tabindex=\"-1\">About</h1>"),
    r("Re-rendering with the same path does not move focus again", "focus a button inside, then rerender with the same path", "the button keeps focus"),
  ],
  'form-error-summary': [
    r("A valid form calls onSubmit with trimmed values and shows no error summary", "type '  Ada  ' and ' ada@example.com ', submit", "onSubmit({ name: 'Ada', email: 'ada@example.com' }); no [role=alert]"),
    r("An invalid submit does not call onSubmit and shows a summary with one link per error, in field order", "submit the empty form", "onSubmit not called; <h2>There is a problem</h2> with links 'Enter your name' and 'Enter a valid email address'"),
    r("Focus moves to the summary heading after an invalid submit", "submit the empty form", "document.activeElement is the summary <h2 tabindex=\"-1\">"),
    r("Focus returns to the summary heading on every invalid submit, not just the first", "submit empty; click a summary link (focus moves to the field); submit empty again", "focus is back on the summary <h2>"),
    r("Each summary link points at its field and focuses it", "click each summary link", "hrefs '#name', '#email'; the matching input gets focus"),
    r("Invalid inputs get aria-invalid and aria-describedby pointing at their inline error; valid ones get neither", "name 'Ada', email 'bad', submit", "email: aria-invalid=\"true\", aria-describedby=\"email-error\"; name has neither"),
    r("Fixing one field leaves only the remaining error on the next submit", "submit empty; fill name; submit; fill email; submit", "second summary has only the email error; third submit calls onSubmit and removes the summary"),
  ],
};

import { c } from './part1.mjs';
const r = (d, i, e) => c(d, i, e, { v: false, note: 'covered by the DOM harness' });

// React 19, batch R1: use(promise)+Suspense, tabs with useTransition, useActionState form.
export default {
  'suspense-use-promise': [
    r("Shows the fallback while the promise is pending", "promise still pending", "only 'Loading\u2026' is visible"),
    r("Shows the resolved user once the promise resolves", "promise resolves with { name: 'Ada', role: 'admin' }", "'Ada (admin)'"),
    r("Re-rendering with the same promise does not show the fallback again", "resolved, then re-render with the same promise", "still 'Ada (admin)', no fallback"),
    r("A new promise shows the fallback again, then the new user", "pass a second, pending promise; then resolve it with { name: 'Grace', role: 'dev' }", "'Loading\u2026' first, then 'Grace (dev)'"),
    r("A rejected promise reaches the nearest error boundary instead of being swallowed", "promise rejects with Error('nope') inside an error boundary", "the boundary shows 'boundary: nope'"),
  ],
  'tabs-transition-suspense': [
    r("The first load shows the fallback, then the home content", "mount; then resolve the home promise", "'Loading\u2026' first, then 'Welcome home'"),
    r("Switching tabs keeps the old panel on screen (no fallback) while the new one loads", "home loaded; click Posts while its promise is pending", "the panel still shows 'Welcome home', not 'Loading\u2026'"),
    r("The tab panel is aria-busy=\"true\" while the transition is pending and \"false\" otherwise", "click Posts, wait, then resolve posts", "aria-busy 'false' before, 'true' while pending, 'false' after"),
    r("When the new content arrives the panel and the selected tab switch together", "click Posts; resolve posts", "Home stays selected while pending; then panel 'Latest posts' and Posts selected together"),
    r("Going back to an already loaded tab shows its content straight away", "go to Posts, then back to Home", "'Welcome home' immediately, Home selected"),
  ],
  'action-state-form': [
    r("Starts idle: no message and an enabled Subscribe button", "render <SubscribeForm subscribe={\u2026}>", "status text ''; button 'Subscribe', enabled"),
    r("A blank email shows an error and never calls subscribe", "type '   ' and submit", "status 'Enter an email'; subscribe not called"),
    r("While the action runs the button is disabled and reads \"Subscribing\u2026\"", "submit while subscribe() is still pending, then resolve it", "button disabled and 'Subscribing\u2026', then enabled again"),
    r("A successful subscribe shows \"Subscribed <email>\" and enables the button again", "submit 'ada@example.com', subscribe resolves { ok: true }", "status 'Subscribed ada@example.com'; button 'Subscribe', enabled"),
    r("A failed subscribe shows the error message from the server", "subscribe resolves { ok: false, error: 'Already subscribed' }", "status 'Already subscribed'"),
    r("The email is trimmed before it is sent", "type '  ada@example.com  ' and submit", "subscribe called once with 'ada@example.com'"),
  ],
};

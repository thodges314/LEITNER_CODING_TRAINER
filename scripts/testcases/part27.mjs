import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by the DOM harness', ...o });

// react-components, batch 5.
export default {
  'multi-step-form': [
    r('Shows step 1 of N with its title and fields', 'steps: Account (email), Profile (first, last), Plan (plan)', "'Step 1 of 3'; <h2>Account</h2>; one input; a 'Next' button", {
      callSignature: "<Wizard steps={[{ title: 'Account', fields: [{ name: 'email', label: 'Email' }] }, { title: 'Profile', fields: [{ name: 'first', label: 'First name' }, { name: 'last', label: 'Last name' }] }, { title: 'Plan', fields: [{ name: 'plan', label: 'Plan' }] }]} onSubmit={handleSubmit} />",
    }),
    r('Back is disabled on the first step', 'first step', 'Back button disabled', {
      callSignature: "<Wizard steps={steps} onSubmit={handleSubmit} /> (Back button disabled on step 1)",
    }),
    r('Next is blocked with an alert until every field of the step is filled (blank counts as empty)', "click Next with an empty (or '   ') email", "stays on Account; <p role='alert'>All fields are required</p>", {
      callSignature: "click Next with empty email",
    }),
    r('Next moves forward, Back returns and keeps typed values, and the alert clears when the step changes', "type an email, Next → 'Profile'; Next again (empty) shows the alert; Back", "'Profile', 'Step 2 of 3', 2 inputs; after Back: Account with the email still typed and no alert", {
      callSignature: "type email -> Next -> Profile -> Back",
    }),
    r('The last step shows Submit and submits the values of all steps', "fill email; Next; fill first/last; Next; fill plan; Submit", "onSubmit({ email, first, last, plan }) once; the last step has 'Submit' and no 'Next'", {
      callSignature: "fill all steps -> Submit",
    }),
    r('The last step does not submit while a field is empty', "a single-step wizard; Submit with an empty field", 'onSubmit not called; alert shown', {
      callSignature: "submit empty single-step wizard",
    }),
  ],
  'tag-input': [
    r('Renders the tags in a labelled list with a Remove button each', "value={['react', 'css']}", "<ul aria-label='Tags'> react, css; buttons 'Remove react', 'Remove css'; input aria-label='Add tag'", {
      callSignature: "<TagInput value={['react', 'css']} onChange={handleChange} max={Infinity} />",
    }),
    r('Enter adds the trimmed text as a tag and clears the input', "type '  vue  ', Enter", "tags: vue; input empty", {
      callSignature: "type '  vue  ' -> Enter",
    }),
    r('A comma also adds the tag, and the key default is prevented', "type 'svelte', ','", "tags: svelte; keydown ',' defaultPrevented === true", {
      callSignature: "type 'svelte' -> ','",
    }),
    r('Duplicates (case-insensitive) and empty text are ignored', "value ['React']; add 'react', then '   '", "tags stay ['React']; input cleared", {
      callSignature: "<TagInput value={['React']} /> (duplicate / whitespace ignored)",
    }),
    r('Backspace in an empty input removes the last tag (not while typing)', "['a','b']: Backspace; then type 'x' and Backspace", "['a'] after the first; unchanged after the second", {
      callSignature: "<TagInput value={['a', 'b']} /> (Backspace in empty input)",
    }),
    r('The Remove button removes that tag', "click 'Remove a' on ['a','b']", "['b']", {
      callSignature: "click 'Remove a'",
    }),
    r('No more tags are added once max is reached', "value ['a'], max=2: add 'b' then 'c'", "['a','b']; onChange called once", {
      callSignature: "<TagInput value={['a']} max={2} /> (max tags limit)",
    }),
  ],
  'pagination-controls': [
    r('Renders Previous, the numbered pages and Next in a labelled nav', '<Pagination page={1} totalPages={4} />', "nav aria-label='Pagination'; items 1,2,3,4 (page 3 is the single gap, so it is shown); Previous and Next buttons"),
    r('The current page has aria-current="page" (and only it)', '<Pagination page={3} totalPages={5} />', "only the '3' button has aria-current='page'"),
    r('Long ranges collapse with ellipses around the current page', '<Pagination page={5} totalPages={10} />', "'1,…,4,5,6,…,10'; '1,2,…,10'; '1,…,9,10'"),
    r('A single missing page is shown instead of an ellipsis', '<Pagination page={4} totalPages={7} />', "'1,2,3,4,5,6,7'; then '1,…,4,5,6,…,9'"),
    r('siblings widens the window around the current page', '<Pagination page={5} totalPages={12} siblings={2} />', "'1,2,3,4,5,6,7,…,12'"),
    r('Previous, Next and the page buttons call onPageChange with the target page', "<Pagination page={3} totalPages={6} onPageChange={handlePageChange} />", 'onPageChange called with 2, 4, 6'),
    r('Previous is disabled on the first page and Next on the last', '<Pagination page={1} totalPages={4} />', 'Previous disabled / Next disabled respectively'),
    r('The ellipsis is plain text, not a button', "click the '…' item", 'it contains no <button>; onPageChange not called'),
  ],
};

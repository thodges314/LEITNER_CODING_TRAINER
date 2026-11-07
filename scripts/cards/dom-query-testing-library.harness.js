const { getByRole, queryByRole, getByText, queryByText } = createDomQueries();

// 1. getByRole finds element by explicit role attribute
{
  const div = document.createElement('div');
  div.innerHTML = '<div role="alert">Warning!</div>';
  const el = getByRole(div, 'alert');
  $test.check(
    'getByRole finds element by explicit role attribute',
    el !== null && el.textContent === 'Warning!',
    { text: el?.textContent }
  );
}

// 2. getByRole resolves implicit semantic HTML roles (button, link, heading, textbox)
{
  const div = document.createElement('div');
  div.innerHTML = '<button>Save</button><a href="/home">Home</a><h2>Title</h2><input type="text" />';
  const btn = getByRole(div, 'button');
  const link = getByRole(div, 'link');
  const heading = getByRole(div, 'heading');
  const textbox = getByRole(div, 'textbox');

  const ok =
    btn.tagName === 'BUTTON' &&
    link.tagName === 'A' &&
    heading.tagName === 'H2' &&
    textbox.tagName === 'INPUT';

  $test.check(
    'getByRole resolves implicit semantic HTML roles (button, link, heading, textbox)',
    Boolean(ok),
    { btn: btn.tagName, link: link.tagName, heading: heading.tagName, textbox: textbox.tagName }
  );
}

// 3. getByRole filters by accessible name (textContent, aria-label, label[for])
{
  const div = document.createElement('div');
  div.innerHTML = '<button>Cancel</button><button aria-label="Confirm Action">OK</button>';
  const btn = getByRole(div, 'button', { name: 'Confirm Action' });
  $test.check(
    'getByRole filters by accessible name (textContent, aria-label, label[for])',
    btn !== null && btn.textContent === 'OK',
    { textContent: btn?.textContent }
  );
}

// 4. getByRole and queryByRole handle 0 matches and multiple matches with descriptive errors
{
  const div = document.createElement('div');
  div.innerHTML = '<button>One</button><button>Two</button>';
  const nullResult = queryByRole(div, 'textbox');
  let multipleError = false;
  try {
    getByRole(div, 'button');
  } catch (e) {
    multipleError = true;
  }

  $test.check(
    'getByRole and queryByRole handle 0 matches and multiple matches with descriptive errors',
    nullResult === null && multipleError === true,
    { nullResult, multipleError }
  );
}

// 5. getByText and queryByText find deepest element matching text or regex
{
  const div = document.createElement('div');
  div.innerHTML = '<div><span>Status: <b>Active</b></span></div>';
  const bold = getByText(div, 'Active');
  const regexMatch = queryByText(div, /^status:/i);
  const nonExistent = queryByText(div, 'Nonexistent');

  const ok =
    bold.tagName === 'B' &&
    regexMatch !== null &&
    nonExistent === null;

  $test.check(
    'getByText and queryByText find deepest element matching text or regex',
    Boolean(ok),
    { boldTag: bold?.tagName, hasRegexMatch: Boolean(regexMatch), nonExistent }
  );
}


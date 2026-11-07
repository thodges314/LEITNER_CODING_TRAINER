if (typeof createDomQueries !== 'function') {
  $test.check(
    'createDomQueries function is defined',
    false,
    { error: 'createDomQueries is not defined. Implement createDomQueries() to return DOM query utilities.' }
  );
} else {
  const { getByRole, queryByRole, getByText, queryByText } = createDomQueries();

  // 1. getByRole finds element by explicit role attribute
  {
    try {
      const div = document.createElement('div');
      div.innerHTML = '<div role="alert">Warning!</div>';
      const el = getByRole ? getByRole(div, 'alert') : null;
      $test.check(
        'getByRole finds element by explicit role attribute',
        el !== null && el?.textContent === 'Warning!',
        { text: el?.textContent }
      );
    } catch (err) {
      $test.check('getByRole finds element by explicit role attribute', false, { error: String(err) });
    }
  }

  // 2. getByRole resolves implicit semantic HTML roles (button, link, heading, textbox)
  {
    try {
      const div = document.createElement('div');
      div.innerHTML = '<button>Save</button><a href="/home">Home</a><h2>Title</h2><input type="text" />';
      const btn = getByRole ? getByRole(div, 'button') : null;
      const link = getByRole ? getByRole(div, 'link') : null;
      const heading = getByRole ? getByRole(div, 'heading') : null;
      const textbox = getByRole ? getByRole(div, 'textbox') : null;

      const ok =
        btn?.tagName === 'BUTTON' &&
        link?.tagName === 'A' &&
        heading?.tagName === 'H2' &&
        textbox?.tagName === 'INPUT';

      $test.check(
        'getByRole resolves implicit semantic HTML roles (button, link, heading, textbox)',
        Boolean(ok),
        { btn: btn?.tagName, link: link?.tagName, heading: heading?.tagName, textbox: textbox?.tagName }
      );
    } catch (err) {
      $test.check('getByRole resolves implicit semantic HTML roles (button, link, heading, textbox)', false, { error: String(err) });
    }
  }

  // 3. getByRole filters by accessible name (textContent, aria-label, label[for])
  {
    try {
      const div = document.createElement('div');
      div.innerHTML = '<button>Cancel</button><button aria-label="Confirm Action">OK</button>';
      const btn = getByRole ? getByRole(div, 'button', { name: 'Confirm Action' }) : null;
      $test.check(
        'getByRole filters by accessible name (textContent, aria-label, label[for])',
        btn !== null && btn?.textContent === 'OK',
        { textContent: btn?.textContent }
      );
    } catch (err) {
      $test.check('getByRole filters by accessible name (textContent, aria-label, label[for])', false, { error: String(err) });
    }
  }

  // 4. getByRole and queryByRole handle 0 matches and multiple matches with descriptive errors
  {
    try {
      const div = document.createElement('div');
      div.innerHTML = '<button>One</button><button>Two</button>';
      const nullResult = queryByRole ? queryByRole(div, 'textbox') : undefined;
      let multipleError = false;
      try {
        if (getByRole) getByRole(div, 'button');
      } catch {
        multipleError = true;
      }

      $test.check(
        'getByRole and queryByRole handle 0 matches and multiple matches with descriptive errors',
        nullResult === null && multipleError === true,
        { nullResult, multipleError }
      );
    } catch (err) {
      $test.check('getByRole and queryByRole handle 0 matches and multiple matches with descriptive errors', false, { error: String(err) });
    }
  }

  // 5. getByText and queryByText find deepest element matching text or regex
  {
    try {
      const div = document.createElement('div');
      div.innerHTML = '<div><span>Status: <b>Active</b></span></div>';
      const bold = getByText ? getByText(div, 'Active') : null;
      const regexMatch = queryByText ? queryByText(div, /^status:/i) : null;
      const nonExistent = queryByText ? queryByText(div, 'Nonexistent') : undefined;

      const ok =
        bold?.tagName === 'B' &&
        regexMatch !== null &&
        nonExistent === null;

      $test.check(
        'getByText and queryByText find deepest element matching text or regex',
        Boolean(ok),
        { boldTag: bold?.tagName, hasRegexMatch: Boolean(regexMatch), nonExistent }
      );
    } catch (err) {
      $test.check('getByText and queryByText find deepest element matching text or regex', false, { error: String(err) });
    }
  }
}

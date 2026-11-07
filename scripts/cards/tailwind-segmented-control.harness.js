const { render, fire, act } = $dom;

const sampleOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly', disabled: true },
  { value: 'yearly', label: 'Yearly' },
];

// 1. Renders semantic tablist container with base Tailwind styling
{
  const r = render(
    <SegmentedControl
      options={sampleOptions}
      value="daily"
      onChange={() => {}}
    />
  );
  const tablist = r.container.querySelector('[role="tablist"]');
  const hasTablist = tablist !== null && tablist.tagName.toLowerCase() === 'div';
  const hasOrientation = tablist?.getAttribute('aria-orientation') === 'horizontal';
  const hasBaseClasses =
    tablist?.classList.contains('bg-slate-900') &&
    tablist?.classList.contains('border-slate-800') &&
    tablist?.classList.contains('rounded-xl');

  $test.check(
    'Renders semantic tablist container with base Tailwind styling',
    Boolean(hasTablist && hasOrientation && hasBaseClasses),
    { hasTablist, hasOrientation, hasBaseClasses }
  );
  r.unmount();
}

// 2. Renders options with proper tab roles, selected state, and styling
{
  const r = render(
    <SegmentedControl
      options={sampleOptions}
      value="weekly"
      onChange={() => {}}
    />
  );
  const tabs = r.container.querySelectorAll('[role="tab"]');
  const hasFourTabs = tabs.length === 4;

  const weeklyTab = Array.from(tabs).find((t) => t.textContent.includes('Weekly'));
  const isSelected = weeklyTab?.getAttribute('aria-selected') === 'true';
  const hasIndigo = weeklyTab?.classList.contains('bg-indigo-600');
  const hasTabIndex0 = weeklyTab?.getAttribute('tabindex') === '0';

  const dailyTab = Array.from(tabs).find((t) => t.textContent.includes('Daily'));
  const isDailyInactive = dailyTab?.getAttribute('aria-selected') === 'false';
  const hasTabIndexMinus1 = dailyTab?.getAttribute('tabindex') === '-1';

  const monthlyTab = Array.from(tabs).find((t) => t.textContent.includes('Monthly'));
  const isMonthlyDisabled = monthlyTab?.hasAttribute('disabled') && monthlyTab?.classList.contains('opacity-40');

  $test.check(
    'Renders options with proper tab roles, selected state, and styling',
    Boolean(hasFourTabs && isSelected && hasIndigo && hasTabIndex0 && isDailyInactive && hasTabIndexMinus1 && isMonthlyDisabled),
    { hasFourTabs, isSelected, hasIndigo, isDailyInactive, isMonthlyDisabled }
  );
  r.unmount();
}

// 3. Invokes onChange callback when clicking an enabled option
{
  let selectedValue = null;
  const r = render(
    <SegmentedControl
      options={sampleOptions}
      value="daily"
      onChange={(val) => {
        selectedValue = val;
      }}
    />
  );
  const yearlyTab = Array.from(r.container.querySelectorAll('[role="tab"]')).find((t) =>
    t.textContent.includes('Yearly')
  );
  if (yearlyTab) {
    act(() => {
      fire.click(yearlyTab);
    });
  }

  $test.check(
    'Invokes onChange callback when clicking an enabled option',
    selectedValue === 'yearly',
    { selectedValue }
  );
  r.unmount();
}

// 4. Handles ArrowRight / ArrowDown keyboard navigation skipping disabled options
{
  let changedValue = null;
  const r = render(
    <SegmentedControl
      options={sampleOptions}
      value="weekly"
      onChange={(val) => {
        changedValue = val;
      }}
    />
  );
  const weeklyTab = Array.from(r.container.querySelectorAll('[role="tab"]')).find((t) =>
    t.textContent.includes('Weekly')
  );

  fire.keyDown(weeklyTab, 'ArrowRight');

  // Since monthly is disabled, it should jump from weekly directly to yearly!
  $test.check(
    'Handles ArrowRight keyboard navigation skipping disabled options',
    changedValue === 'yearly',
    { changedValue }
  );
  r.unmount();
}

// 5. Supports fullWidth prop applying w-full and flex-1
{
  const r = render(
    <SegmentedControl
      options={sampleOptions}
      value="daily"
      onChange={() => {}}
      fullWidth={true}
    />
  );
  const tablist = r.container.querySelector('[role="tablist"]');
  const hasWFull = tablist?.classList.contains('w-full');
  const tabs = r.container.querySelectorAll('[role="tab"]');
  const allHaveFlex1 = Array.from(tabs).every((t) => t.classList.contains('flex-1'));

  $test.check(
    'Supports fullWidth prop applying w-full and flex-1',
    Boolean(hasWFull && allHaveFlex1),
    { hasWFull, allHaveFlex1 }
  );
  r.unmount();
}


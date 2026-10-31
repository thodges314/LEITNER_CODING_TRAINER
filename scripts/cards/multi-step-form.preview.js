const defaultWizardSteps = [
  {
    title: 'Account Information',
    fields: [
      { name: 'username', label: 'Username:' },
      { name: 'email', label: 'Email:' },
    ],
  },
  {
    title: 'Profile Details',
    fields: [
      { name: 'fullName', label: 'Full Name:' },
      { name: 'role', label: 'Role:' },
    ],
  },
];

function Demo() {
  const { steps = defaultWizardSteps, onSubmit } = usePreviewProps({
    steps: defaultWizardSteps,
  });

  const parsedSteps = Array.isArray(steps) && steps.length > 0 ? steps : defaultWizardSteps;

  return (
    <div style={{ padding: '16px' }}>
      <Wizard
        key={JSON.stringify(parsedSteps)}
        steps={parsedSteps}
        onSubmit={(values) => {
          if (onSubmit) onSubmit(values);
          log('onSubmit', values);
        }}
      />
    </div>
  );
}

<Demo />

const wizardSteps = [
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
  return (
    <div style={{ padding: '16px' }}>
      <Wizard steps={wizardSteps} onSubmit={log('onSubmit')} />
    </div>
  );
}

<Demo />

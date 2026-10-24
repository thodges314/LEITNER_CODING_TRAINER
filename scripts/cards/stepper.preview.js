const sampleSteps = [
  { id: '1', title: 'Personal Details', description: 'Name & Contact' },
  { id: '2', title: 'Account Setup', description: 'Password & Security' },
  { id: '3', title: 'Confirmation', description: 'Review & Submit' },
];

function StepperDemo() {
  const [completed, setCompleted] = useState(false);

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Stepper
        steps={sampleSteps}
        onStepChange={(idx) => log('onStepChange')(idx)}
        onComplete={() => {
          setCompleted(true);
          log('onComplete')('Stepper flow finished!');
        }}
      />
      {completed && (
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid #34d399', borderRadius: '8px' }}>
          Registration flow completed successfully!
        </div>
      )}
    </div>
  );
}

<StepperDemo />

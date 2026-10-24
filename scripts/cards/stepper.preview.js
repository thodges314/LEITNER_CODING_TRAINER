const sampleSteps = [
  { id: '1', title: 'Personal Details', description: 'Name & Contact' },
  { id: '2', title: 'Account Setup', description: 'Password & Security' },
  { id: '3', title: 'Confirmation', description: 'Review & Submit' },
];

function StepperDemo() {
  const [completed, setCompleted] = useState(false);

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <style>{`
        nav[aria-label="Progress"] ol {
          display: flex;
          align-items: flex-start;
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
          gap: 12px;
        }
        nav[aria-label="Progress"] li {
          flex: 1;
        }
        nav[aria-label="Progress"] li button {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          background: #1e293b;
          border: 1.5px solid #334155;
          color: #94a3b8;
          cursor: pointer;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 2px;
          transition: all 0.2s ease;
        }
        nav[aria-label="Progress"] [data-status="active"] button {
          border-color: #38bdf8;
          color: #f8fafc;
          background: rgba(56, 189, 248, 0.12);
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
        }
        nav[aria-label="Progress"] [data-status="completed"] button {
          border-color: #34d399;
          color: #34d399;
          background: rgba(52, 211, 153, 0.08);
        }
        nav[aria-label="Progress"] [data-status="upcoming"] button {
          opacity: 0.45;
          cursor: not-allowed;
        }
        [data-action="prev"], [data-action="next"] {
          padding: 7px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        [data-action="next"] {
          background: #0284c7;
          color: #fff;
          border: none;
        }
        [data-action="prev"] {
          background: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
          margin-right: 10px;
        }
        [data-action="prev"]:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>
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

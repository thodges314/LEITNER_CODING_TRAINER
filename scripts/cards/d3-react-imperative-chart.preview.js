const DEFAULT_DATA = [
  { label: 'Mon', value: 18 },
  { label: 'Tue', value: 42 },
  { label: 'Wed', value: 31 },
  { label: 'Thu', value: 65 },
  { label: 'Fri', value: 50 },
  { label: 'Sat', value: 24 },
  { label: 'Sun', value: 38 },
];

function Demo() {
  const {
    data = DEFAULT_DATA,
    width = 360,
    height = 160,
  } = usePreviewProps({
    data: DEFAULT_DATA,
    width: 360,
    height: 160,
  });

  return (
    <div style={{ padding: '16px' }}>
      <ChartDashboard
        data={data}
        width={Number(width) || 360}
        height={Number(height) || 160}
      />
    </div>
  );
}

<Demo />

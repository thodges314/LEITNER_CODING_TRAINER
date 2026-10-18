function Demo() {
  const sampleNumbers = [42, 7, 19, 3, 99, 14, 28];
  return (
    <div style={{ padding: '16px' }}>
      <SortedList items={sampleNumbers} onCompute={log('onCompute')} />
    </div>
  );
}

<Demo />

function Demo() {
  const [rating, setRating] = useState(3);
  const logger = log('onChange');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <StarRating
        value={rating}
        max={5}
        onChange={(next) => {
          setRating(next);
          logger(next);
        }}
      />
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
        Current rating: {rating} / 5
      </div>
    </div>
  );
}

<Demo />

function Demo() {
  const { value, max, label } = usePreviewProps({
    value: 45,
    max: 100,
    label: 'Upload Progress',
  });

  useEffect(() => {
    log('progress')({ value, max, label });
  }, [value, max, label]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px' }}>
      <style>{`
        [role="progressbar"] {
          position: relative;
          width: 100%;
          height: 24px;
          background-color: rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
        }
        [role="progressbar"] [data-fill] {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, #06b6d4, #3b82f6);
          transition: width 0.2s ease;
          border-radius: 12px;
        }
        [role="progressbar"][data-indeterminate="true"] [data-fill] {
          width: 35% !important;
          animation: leitner-indeterminate-slide 1.4s infinite ease-in-out;
        }
        [role="progressbar"] span {
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }
        @keyframes leitner-indeterminate-slide {
          0% { left: -35%; }
          100% { left: 100%; }
        }
      `}</style>
      <ProgressBar
        value={value}
        max={max}
        label={label}
      />
    </div>
  );
}

<Demo />

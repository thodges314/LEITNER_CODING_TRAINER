const defaultSlides = [
  'Slide 1: Welcome to Leitner',
  'Slide 2: Spaced Repetition',
  'Slide 3: Cold-Start Mastery',
];

function Demo() {
  const { slides = defaultSlides, loop = true, autoPlayMs } = usePreviewProps({
    slides: defaultSlides,
    loop: true,
    autoPlayMs: 3000,
  });

  return (
    <div style={{ padding: '16px' }}>
      <Carousel
        slides={Array.isArray(slides) && slides.length > 0 ? slides : defaultSlides}
        loop={Boolean(loop)}
        autoPlayMs={autoPlayMs ? Number(autoPlayMs) : undefined}
      />
    </div>
  );
}

<Demo />

const carouselSlides = [
  <div key="1" style={{ height: '120px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>Slide 1: Welcome to Leitner</div>,
  <div key="2" style={{ height: '120px', background: 'linear-gradient(135deg, #0d9488, #115e59)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>Slide 2: Spaced Repetition</div>,
  <div key="3" style={{ height: '120px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}>Slide 3: Cold-Start Mastery</div>,
];

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <Carousel slides={carouselSlides} loop={true} />
    </div>
  );
}

<Demo />

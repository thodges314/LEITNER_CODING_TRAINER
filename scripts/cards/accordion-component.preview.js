const sampleAccordionItems = [
  { id: '1', title: 'What is Leitner?', content: 'A spaced repetition learning system based on flashcard boxes.' },
  { id: '2', title: 'How does it work?', content: 'Correct answers advance cards; mistakes return them to box 1.' },
  { id: '3', title: 'Why cold retrieval?', content: 'Strengthens recall memory without hints or autocomplete.' },
];

function Demo() {
  return (
    <div style={{ padding: '16px' }}>
      <Accordion items={sampleAccordionItems} allowMultiple={true} />
    </div>
  );
}

<Demo />

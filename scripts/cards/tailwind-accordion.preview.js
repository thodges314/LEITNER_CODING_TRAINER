function AccordionPreview() {
  const {
    allowMultiple = false,
  } = usePreviewProps({
    allowMultiple: false,
  });

  const faqItems = [
    {
      id: 'faq-1',
      title: 'What makes Tailwind CSS utility-first?',
      content:
        'Instead of pre-designed opinionated UI components, Tailwind provides low-level utility classes that let you build completely custom designs without leaving your HTML.',
    },
    {
      id: 'faq-2',
      title: 'How does JIT compilation optimize bundle size?',
      content:
        'The Just-in-Time engine scans your templates in real time and generates only the exact CSS rules you actually use, keeping the production stylesheet under 10kB.',
    },
    {
      id: 'faq-3',
      title: 'Can accordions be fully keyboard accessible?',
      content:
        'Yes. By pairing aria-expanded, aria-controls, and semantic buttons with role="region" panels, screen readers announce state updates and focus moves cleanly.',
    },
    {
      id: 'faq-4',
      title: 'Archived / Deprecated Policy (Disabled)',
      content: 'This policy section has been archived and is not expandable.',
      disabled: true,
    },
  ];

  return (
    <div className="p-8 max-w-xl mx-auto flex items-center justify-center min-h-[220px]">
      <div className="w-full">
        <Accordion
          key={String(allowMultiple)}
          items={faqItems}
          allowMultiple={Boolean(allowMultiple)}
          defaultExpandedIds={['faq-1']}
        />
      </div>
    </div>
  );
}

<AccordionPreview />

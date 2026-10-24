const countries = [
  { id: 'c-us', label: 'United States', value: 'US' },
  { id: 'c-ca', label: 'Canada', value: 'CA' },
  { id: 'c-mx', label: 'Mexico', value: 'MX' },
  { id: 'c-gb', label: 'United Kingdom', value: 'GB' },
  { id: 'c-fr', label: 'France', value: 'FR' },
  { id: 'c-de', label: 'Germany', value: 'DE', disabled: true },
  { id: 'c-jp', label: 'Japan', value: 'JP' },
];

function AccessibleComboboxPreview() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '360px', fontFamily: 'sans-serif' }}>
      <AccessibleCombobox
        id="country-selector"
        label="Destination Country"
        options={countries}
        placeholder="Search countries..."
        onSelect={(opt) => {
          setSelected(opt);
          log('onSelect')(opt);
        }}
      />
      {selected && (
        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', fontSize: '13px' }}>
          Selected: <strong>{selected.label}</strong> ({selected.value})
        </div>
      )}
    </div>
  );
}

<AccessibleComboboxPreview />

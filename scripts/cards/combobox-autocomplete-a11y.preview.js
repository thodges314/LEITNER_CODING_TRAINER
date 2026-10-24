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
  const [selected, setSelected] = useState(null as any);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '380px', fontFamily: 'sans-serif', padding: '10px' }}>
      <style>{`
        [role="combobox"] {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          background: #0f172a;
          border: 1px solid #334155;
          color: #f8fafc;
          font-size: 13px;
          box-sizing: border-box;
        }
        [role="combobox"]:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
        }
        [role="listbox"] {
          margin: 4px 0 0 0;
          padding: 4px;
          list-style: none;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 6px;
          max-height: 180px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        [role="option"] {
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 13px;
          color: #cbd5e1;
          cursor: pointer;
        }
        [role="option"][aria-selected="true"] {
          background: #0284c7;
          color: #ffffff;
        }
        [role="option"][aria-disabled="true"] {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
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
        <div style={{ padding: '8px 12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', fontSize: '13px', color: '#f8fafc' }}>
          Selected: <strong style={{ color: '#38bdf8' }}>{selected.label}</strong> ({selected.value})
        </div>
      )}
    </div>
  );
}

<AccessibleComboboxPreview />

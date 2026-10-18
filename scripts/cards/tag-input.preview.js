function Demo() {
  const [tags, setTags] = useState(['react', 'javascript', 'typescript']);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8' }}>
        Press Enter or comma to add a tag, Backspace on empty input to remove last tag (max 5).
      </p>
      <TagInput
        value={tags}
        max={5}
        onChange={(next) => {
          setTags(next);
          log('onChange', next);
        }}
      />
    </div>
  );
}

<Demo />

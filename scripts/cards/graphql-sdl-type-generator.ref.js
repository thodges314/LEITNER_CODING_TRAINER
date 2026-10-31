function generateTypeDefs(models) {
  if (!Array.isArray(models) || models.length === 0) return '';

  return models
    .map((model) => {
      const desc = model.description ? `"""${model.description}"""\n` : '';
      const fields = (model.fields || [])
        .map((f) => {
          let t = f.type;
          if (f.isArray) {
            t = `[${t}${f.itemRequired ? '!' : ''}]`;
          }
          if (f.required) {
            t = `${t}!`;
          }
          return `  ${f.name}: ${t}`;
        })
        .join('\n');

      return `${desc}type ${model.name} {\n${fields}\n}`;
    })
    .join('\n\n');
}

const compileChecksU1 = () => {
  // @ts-expect-error — a boolean is not part of the accepted union
  describe(true);
  // @ts-expect-error — a shape needs radius or width and height
  area({ side: 2 });
  // @ts-expect-error — the rectangle variant requires height too
  area({ width: 2 });
};
$test.check('Compile time: values outside the union are rejected', typeof compileChecksU1 === 'function');

interface Events65 { login: { userId: string }; logout: undefined }
const typedEmitter = new TypedEmitter<Events65>();
const compileChecks65 = () => {
  // @ts-expect-error — payload must be { userId: string }
  typedEmitter.emit('login', { userId: 42 });
  // @ts-expect-error — unknown event name
  typedEmitter.emit('nope', 1);
  // @ts-expect-error — the listener parameter must match the payload type
  typedEmitter.on('login', (d: number) => {});
};
$test.check('Compile time: payloads and event names are type-checked', typeof compileChecks65 === 'function');

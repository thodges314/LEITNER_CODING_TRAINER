import { describe, it, expect } from 'vitest';
import { formatCode } from './formatter';

describe('formatCode', () => {
  it('formats unformatted JavaScript properly with 2 spaces and single quotes', async () => {
    const raw = 'const  fn = ( a , b ) => { return   a+b; };';
    const res = await formatCode(raw, false);
    expect(res.success).toBe(true);
    expect(res.code).toBe('const fn = (a, b) => {\n  return a + b;\n};\n');
  });

  it('formats JSX elements cleanly', async () => {
    const raw = 'function Component(){return <div><h1>Title</h1><p>Hello world</p></div>}';
    const res = await formatCode(raw, false);
    expect(res.success).toBe(true);
    expect(res.code).toContain('<div>');
    expect(res.code).toContain('<h1>Title</h1>');
  });

  it('formats TypeScript annotations when isTypeScript is true', async () => {
    const raw = 'interface User{id:string;name:string;age?:number}const getUser=(u:User):string=>u.name;';
    const res = await formatCode(raw, true);
    expect(res.success).toBe(true);
    expect(res.code).toContain('interface User {');
    expect(res.code).toContain('const getUser = (u: User): string => u.name;');
  });

  it('returns success for empty or whitespace-only code', async () => {
    const res = await formatCode('   ', false);
    expect(res.success).toBe(true);
    expect(res.code).toBe('   ');
  });

  it('catches syntax errors gracefully without throwing', async () => {
    const raw = 'const x = { broken: ;';
    const res = await formatCode(raw, false);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.code).toBe(raw);
  });
});

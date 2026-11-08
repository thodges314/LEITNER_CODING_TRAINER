import { describe, it, expect } from 'vitest';
import { loadSandboxLibrariesForCode } from './sandboxLibraries';

describe('loadSandboxLibrariesForCode', () => {
  it('returns no optional heavy libraries for plain JS/TS cards', async () => {
    const libs = await loadSandboxLibrariesForCode('function add(a, b) { return a + b; }', 'algorithms');
    expect(libs.PGlite).toBeUndefined();
    expect(libs.graphql).toBeUndefined();
    expect(libs.d3).toBeUndefined();
  });

  it('loads PGlite on demand for sql-postgres track or PGlite code', async () => {
    const libs = await loadSandboxLibrariesForCode('SELECT 1;', 'sql-postgres');
    expect(libs.PGlite).toBeDefined();
    expect(libs.graphql).toBeUndefined();
    expect(libs.d3).toBeUndefined();
  });

  it('loads graphql on demand for graphql track or buildSchema code', async () => {
    const libs = await loadSandboxLibrariesForCode('const s = buildSchema("type Query { ok: Boolean }");', 'algorithms');
    expect(libs.graphql).toBeDefined();
    expect(typeof libs.graphql?.buildSchema).toBe('function');
    expect(typeof libs.graphql?.graphql).toBe('function');
  });

  it('loads d3 on demand for d3 track unless includeDomLibs is false', async () => {
    const workerLibs = await loadSandboxLibrariesForCode('d3.select("svg")', 'd3', { includeDomLibs: false });
    expect(workerLibs.d3).toBeUndefined();

    const domLibs = await loadSandboxLibrariesForCode('d3.select("svg")', 'd3', { includeDomLibs: true });
    expect(domLibs.d3).toBeDefined();
    expect(typeof domLibs.d3?.select).toBe('function');
  });
});

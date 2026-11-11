#!/usr/bin/env node
// Falha se algum arquivo de src/ dos frontends nao for alcancavel a partir de src/index.tsx.
// Evita codigo morto que engana quem edita (ex.: menu duplicado em arquivo nao usado).
// Uso: node scripts/ci/find-unused-frontend.js <pasta-do-frontend> [...]
const fs = require('fs');
const path = require('path');

// Arquivos mantidos de proposito, sem import. Registre o motivo ao incluir.
const ALLOWLIST = new Set([
  'src/jest-runtime.d.ts', // declaracao de tipos ambiente, nunca importada
  'src/components/member/MemberContributionSection.tsx', // referencia da PM-048 (docs/PLANO-MELHORIAS.md)
]);

const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'];
const IMPORT_RE =
  /(?:import|export)[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)|jest\.mock\(\s*['"]([^'"]+)['"]/g;
const isCode = (f) => /\.(tsx?|jsx?)$/.test(f);
const isTestSupport = (f) => /\.test\.|setupTests|react-app-env|__tests__/.test(f);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    fs.statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

function resolveImport(from, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  const candidates = [base, ...EXTS.map((e) => base + e), ...EXTS.map((e) => path.join(base, 'index' + e))];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

let failed = false;
for (const arg of process.argv.slice(2)) {
  const root = path.resolve(arg);
  const src = path.join(root, 'src');
  const reachable = new Set();
  const queue = [path.join(src, 'index.tsx')];
  while (queue.length) {
    const file = queue.pop();
    if (reachable.has(file)) continue;
    reachable.add(file);
    if (!isCode(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    IMPORT_RE.lastIndex = 0;
    let m;
    while ((m = IMPORT_RE.exec(text))) {
      const target = resolveImport(file, m[1] || m[2] || m[3] || m[4] || m[5]);
      if (target) queue.push(target);
    }
  }
  const unused = walk(src)
    .filter((f) => isCode(f) && !reachable.has(f) && !isTestSupport(f))
    .map((f) => path.relative(root, f).split(path.sep).join('/'))
    .filter((f) => !ALLOWLIST.has(f))
    .sort();
  if (unused.length) {
    failed = true;
    console.error(`${path.basename(root)}: arquivos sem uso (nao importados a partir de src/index.tsx):`);
    unused.forEach((f) => console.error(`  - ${f}`));
  } else {
    console.log(`${path.basename(root)}: nenhum arquivo sem uso`);
  }
}
if (failed) {
  console.error('\nRemova os arquivos ou, se forem intencionais, inclua-os na ALLOWLIST de scripts/ci/find-unused-frontend.js com o motivo.');
  process.exit(1);
}

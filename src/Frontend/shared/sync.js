#!/usr/bin/env node
// Copia o codigo compartilhado (src/Frontend/shared/<nome>) para <app>/src/_shared/<nome>.
// O CRA so compila arquivos dentro de src/, entao cada app recebe uma copia GERADA (ignorada pelo git).
// Rodado automaticamente em prestart/prebuild/pretest. Uso: node ../shared/sync.js  (dentro da pasta do app)
const fs = require('fs');
const path = require('path');

const sharedRoot = __dirname;
const target = path.resolve(process.cwd(), 'src', '_shared');

fs.rmSync(target, { recursive: true, force: true });
for (const entry of fs.readdirSync(sharedRoot, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    fs.cpSync(path.join(sharedRoot, entry.name), path.join(target, entry.name), { recursive: true });
  }
}
fs.writeFileSync(
  path.join(target, 'README.md'),
  'GERADO por shared/sync.js. NAO edite aqui: a fonte fica em src/Frontend/shared/.\n',
);
console.log(`[shared] sincronizado em ${path.relative(process.cwd(), target)}`);

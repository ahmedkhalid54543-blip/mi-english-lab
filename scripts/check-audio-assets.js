#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(projectRoot, 'js', 'audio-manifest.js');

if (!fs.existsSync(manifestPath)) {
  console.error('audio-manifest.js not found');
  process.exit(1);
}

const source = fs.readFileSync(manifestPath, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);

try {
  vm.runInContext(source, sandbox, { filename: manifestPath });
} catch (error) {
  console.error('Failed to parse audio manifest:', error.message);
  process.exit(1);
}

const manifest = sandbox.window.MI_AUDIO_MANIFEST || {};
const entries = manifest.entries && typeof manifest.entries === 'object'
  ? manifest.entries
  : {};

const missing = [];
let found = 0;

Object.entries(entries).forEach(([text, relPath]) => {
  if (typeof relPath !== 'string' || !relPath.trim()) {
    missing.push({ text, relPath: String(relPath || '') });
    return;
  }

  const absPath = path.join(projectRoot, relPath);
  if (fs.existsSync(absPath)) {
    found += 1;
  } else {
    missing.push({ text, relPath });
  }
});

const total = Object.keys(entries).length;
const coverage = total > 0 ? Math.round((found / total) * 100) : 0;

console.log(`Manifest version: ${manifest.version || 'N/A'}`);
console.log(`Entries: ${total}`);
console.log(`Found: ${found}`);
console.log(`Coverage: ${coverage}%`);

if (missing.length > 0) {
  console.log('\nMissing files:');
  missing.forEach(item => {
    console.log(`- ${item.relPath}  <=  ${item.text}`);
  });
}

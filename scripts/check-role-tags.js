#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataFile = path.resolve(__dirname, '../js/data.js');
const roleFile = path.resolve(__dirname, '../js/role-config.js');
const scenariosFile = path.resolve(__dirname, '../js/scenarios.js');

const sandbox = {
  module: { exports: {} },
  exports: {},
  window: {},
  document: {
    addEventListener: () => {},
    querySelector: () => null,
    createElement: () => ({ textContent: '', innerHTML: '' })
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  navigator: { onLine: true },
  CustomEvent: function CustomEvent() {},
  setTimeout,
  clearTimeout,
  console
};

sandbox.window = sandbox;
vm.createContext(sandbox);

function runFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, sandbox, { filename: file, timeout: 2000 });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  runFile(dataFile);
  runFile(roleFile);

  const DATA = vm.runInContext('DATA', sandbox);
  const roleApi = sandbox.MiRoleConfig;

  assert(DATA && Array.isArray(DATA.lessons), 'DATA.lessons missing');
  assert(roleApi && Array.isArray(roleApi.ROLES), 'MiRoleConfig missing');

  let lessonCount = 0;
  let vocabCount = 0;

  DATA.lessons.forEach((lesson) => {
    lessonCount += 1;
    assert(Array.isArray(lesson.roles) && lesson.roles.length > 0, `Lesson ${lesson.id} missing roles`);

    lesson.vocab.forEach((vocab) => {
      vocabCount += 1;
      assert(Array.isArray(vocab.roles) && vocab.roles.length > 0, `Vocab ${vocab.id} missing roles`);
    });
  });

  runFile(scenariosFile);
  const SCENARIOS = vm.runInContext('SCENARIOS', sandbox);

  assert(Array.isArray(SCENARIOS), 'SCENARIOS missing');
  assert(SCENARIOS.length === 7, `Expected 7 scenarios, got ${SCENARIOS.length}`);

  SCENARIOS.forEach((scene) => {
    assert(Array.isArray(scene.roles) && scene.roles.length > 0, `Scenario ${scene.id} missing roles`);
  });

  console.log(`Role tags check passed`);
  console.log(`Scenarios: ${SCENARIOS.length}`);
  console.log(`Lessons: ${lessonCount}`);
  console.log(`Vocab: ${vocabCount}`);
} catch (error) {
  console.error('Role tags check failed');
  console.error(error.message);
  process.exit(1);
}

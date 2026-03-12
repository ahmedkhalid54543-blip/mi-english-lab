#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_FILE = path.resolve(__dirname, '../js/data.js');
const BASELINE = {
  lessons: 21,
  vocab: 839,
  patterns: 207
};

const allowBaselineDrift = process.argv.includes('--allow-baseline-drift');
const errors = [];
const warnings = [];

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function isString(value) {
  return typeof value === 'string';
}

function isNonEmptyString(value) {
  return isString(value) && value.trim().length > 0;
}

function isIsoDay(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function hasPlaceholder(value) {
  return /^(todo|tbd|n\/a|null|undefined)$/i.test(value.trim());
}

function pushError(message) {
  errors.push(message);
}

function pushWarning(message) {
  warnings.push(message);
}

function loadDataObject() {
  const source = fs.readFileSync(DATA_FILE, 'utf8');
  const sandbox = {
    module: { exports: {} },
    exports: {}
  };

  vm.createContext(sandbox);

  try {
    const wrapped = `${source}\nmodule.exports = { DATA };`;
    const script = new vm.Script(wrapped, { filename: DATA_FILE });
    script.runInContext(sandbox, { timeout: 1000 });
  } catch (error) {
    throw new Error(`Failed to evaluate data.js: ${error.message}`);
  }

  const data = sandbox.module.exports.DATA;
  if (!isPlainObject(data)) {
    throw new Error('DATA object not found or invalid');
  }

  return data;
}

function assertStringField(ownerPath, obj, field, required = true, allowEmpty = false) {
  const value = obj[field];

  if (!isString(value)) {
    if (required) {
      pushError(`${ownerPath}.${field} must be a string`);
    }
    return;
  }

  if (!allowEmpty && value.trim().length === 0) {
    pushError(`${ownerPath}.${field} cannot be empty`);
    return;
  }

  if (hasPlaceholder(value)) {
    pushError(`${ownerPath}.${field} uses placeholder value: "${value}"`);
  }
}

function validateData(data) {
  if (!isPlainObject(data.meta)) {
    pushError('meta must be an object');
  }

  if (!Array.isArray(data.lessons)) {
    pushError('lessons must be an array');
    return { lessonCount: 0, vocabCount: 0, patternCount: 0 };
  }

  const lessonIds = new Set();
  const vocabIds = new Set();
  const patternIds = new Set();
  let vocabCount = 0;
  let patternCount = 0;

  data.lessons.forEach((lesson, lessonIndex) => {
    const lessonPath = `lessons[${lessonIndex}]`;
    if (!isPlainObject(lesson)) {
      pushError(`${lessonPath} must be an object`);
      return;
    }

    assertStringField(lessonPath, lesson, 'id');
    assertStringField(lessonPath, lesson, 'title');
    assertStringField(lessonPath, lesson, 'titleEn');
    assertStringField(lessonPath, lesson, 'date');

    const lessonId = lesson.id;
    if (isString(lessonId) && lessonId.trim().length > 0) {
      if (!/^L\d{2}$/.test(lessonId)) {
        pushError(`${lessonPath}.id "${lessonId}" must match LNN format`);
      }

      if (lessonIds.has(lessonId)) {
        pushError(`Duplicate lesson id: ${lessonId}`);
      } else {
        lessonIds.add(lessonId);
      }
    }

    if (isString(lesson.date) && !isIsoDay(lesson.date)) {
      pushError(`${lessonPath}.date "${lesson.date}" must use YYYY-MM-DD`);
    }

    if (!Array.isArray(lesson.vocab)) {
      pushError(`${lessonPath}.vocab must be an array`);
    } else {
      lesson.vocab.forEach((item, vocabIndex) => {
        const vocabPath = `${lessonPath}.vocab[${vocabIndex}]`;
        if (!isPlainObject(item)) {
          pushError(`${vocabPath} must be an object`);
          return;
        }

        assertStringField(vocabPath, item, 'id');
        assertStringField(vocabPath, item, 'en');
        assertStringField(vocabPath, item, 'zh');
        assertStringField(vocabPath, item, 'scene', false, true);

        if (isString(item.id)) {
          if (isString(lessonId) && lessonId.trim().length > 0) {
            const expected = new RegExp(`^${lessonId}-V\\d+$`);
            if (!expected.test(item.id)) {
              pushError(`${vocabPath}.id "${item.id}" does not match lesson prefix ${lessonId}-Vn`);
            }
          }

          if (vocabIds.has(item.id)) {
            pushError(`Duplicate vocab id: ${item.id}`);
          } else {
            vocabIds.add(item.id);
          }
        }

        vocabCount += 1;
      });
    }

    if (!Array.isArray(lesson.patterns)) {
      pushError(`${lessonPath}.patterns must be an array`);
    } else {
      lesson.patterns.forEach((item, patternIndex) => {
        const patternPath = `${lessonPath}.patterns[${patternIndex}]`;
        if (!isPlainObject(item)) {
          pushError(`${patternPath} must be an object`);
          return;
        }

        assertStringField(patternPath, item, 'id');
        assertStringField(patternPath, item, 'category');
        assertStringField(patternPath, item, 'template');
        assertStringField(patternPath, item, 'explanation');
        assertStringField(patternPath, item, 'example', false, true);

        if (isString(item.id)) {
          if (isString(lessonId) && lessonId.trim().length > 0) {
            const expected = new RegExp(`^${lessonId}-P\\d+$`);
            if (!expected.test(item.id)) {
              pushError(`${patternPath}.id "${item.id}" does not match lesson prefix ${lessonId}-Pn`);
            }
          }

          if (patternIds.has(item.id)) {
            pushError(`Duplicate pattern id: ${item.id}`);
          } else {
            patternIds.add(item.id);
          }
        }

        patternCount += 1;
      });
    }
  });

  if (isPlainObject(data.meta) && Number.isFinite(data.meta.totalLessons)) {
    if (Number(data.meta.totalLessons) !== data.lessons.length) {
      pushError(`meta.totalLessons=${data.meta.totalLessons} but computed lessons=${data.lessons.length}`);
    }
  } else {
    pushError('meta.totalLessons must be a finite number');
  }

  if (!allowBaselineDrift) {
    if (data.lessons.length !== BASELINE.lessons) {
      pushError(`Baseline mismatch: lessons expected ${BASELINE.lessons}, got ${data.lessons.length}`);
    }
    if (vocabCount !== BASELINE.vocab) {
      pushError(`Baseline mismatch: vocab expected ${BASELINE.vocab}, got ${vocabCount}`);
    }
    if (patternCount !== BASELINE.patterns) {
      pushError(`Baseline mismatch: patterns expected ${BASELINE.patterns}, got ${patternCount}`);
    }
  } else {
    pushWarning('Baseline drift check skipped (--allow-baseline-drift).');
  }

  return {
    lessonCount: data.lessons.length,
    vocabCount,
    patternCount
  };
}

function printSummary(result) {
  console.log(`Lessons:  ${result.lessonCount}`);
  console.log(`Vocab:    ${result.vocabCount}`);
  console.log(`Patterns: ${result.patternCount}`);
}

function main() {
  let data;

  try {
    data = loadDataObject();
  } catch (error) {
    console.error('Data health check failed before validation.');
    console.error(error.message);
    process.exit(1);
  }

  const result = validateData(data);

  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }

  if (errors.length > 0) {
    console.error('Data health check failed.');
    errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}`);
    });
    console.error('');
    printSummary(result);
    process.exit(1);
  }

  console.log('Data health check passed.');
  printSummary(result);
}

main();

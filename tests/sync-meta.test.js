const test = require('node:test');
const assert = require('node:assert/strict');

const {
  load,
  markItemUpdated,
  markSelectedRole,
  recordStateChanges,
  mergeStatusMaps,
  mergeScalarValue,
  seedFromState
} = require('../js/sync-meta.js');

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

test('recordStateChanges stores timestamps for changed vocab and pattern items', () => {
  const storage = createMemoryStorage();
  recordStateChanges(
    {
      vocabStatus: { 'L01-V1': 'unknown' },
      patternStatus: { 'L01-P1': 'shaky' },
      selectedRole: 'retail_store'
    },
    {
      vocabStatus: { 'L01-V1': 'mastered' },
      patternStatus: { 'L01-P1': 'unknown' },
      selectedRole: 'gtm_pitch'
    },
    storage,
    { updatedAt: '2026-03-11T10:00:00Z' }
  );

  const snapshot = load(storage);
  assert.equal(snapshot.vocab['L01-V1'].value, 'mastered');
  assert.equal(snapshot.vocab['L01-V1'].updatedAt, '2026-03-11T10:00:00.000Z');
  assert.equal(snapshot.pattern['L01-P1'].value, 'unknown');
  assert.equal(snapshot.selectedRole.value, 'gtm_pitch');
});

test('seedFromState backfills missing metadata without overwriting timestamps', () => {
  const storage = createMemoryStorage();
  markItemUpdated('vocab', 'L01-V1', 'mastered', '2026-03-10T09:00:00Z', storage);
  markSelectedRole('retail_store', '2026-03-10T09:00:00Z', storage);

  const snapshot = seedFromState(
    {
      createdAt: '2026-03-01T00:00:00Z',
      vocabStatus: { 'L01-V1': 'mastered', 'L01-V2': 'unknown' },
      patternStatus: { 'L01-P1': 'shaky' },
      selectedRole: 'retail_store'
    },
    storage
  );

  assert.equal(snapshot.vocab['L01-V1'].updatedAt, '2026-03-10T09:00:00.000Z');
  assert.equal(snapshot.vocab['L01-V2'].updatedAt, '2026-03-01T00:00:00.000Z');
  assert.equal(snapshot.pattern['L01-P1'].value, 'shaky');
  assert.equal(snapshot.selectedRole.updatedAt, '2026-03-10T09:00:00.000Z');
});

test('mergeStatusMaps prefers the newer timestamped value', () => {
  const merged = mergeStatusMaps(
    { 'L01-V1': 'mastered', 'L01-V2': 'unknown' },
    { 'L01-V1': 'shaky', 'L01-V3': 'mastered' },
    {
      'L01-V1': { value: 'mastered', updatedAt: '2026-03-10T08:00:00Z' },
      'L01-V2': { value: 'unknown', updatedAt: '2026-03-10T09:00:00Z' }
    },
    {
      'L01-V1': { value: 'shaky', updatedAt: '2026-03-11T08:00:00Z' },
      'L01-V3': { value: 'mastered', updatedAt: '2026-03-11T09:00:00Z' }
    }
  );

  assert.equal(merged.values['L01-V1'], 'shaky');
  assert.equal(merged.values['L01-V2'], 'unknown');
  assert.equal(merged.values['L01-V3'], 'mastered');
});

test('mergeScalarValue preserves local value when timestamps are missing on both sides', () => {
  const merged = mergeScalarValue(
    'retail_store',
    'gtm_pitch',
    null,
    null
  );

  assert.equal(merged.value, 'retail_store');
  assert.equal(merged.updatedAt, null);
});

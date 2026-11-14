import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidQuestion } from './questionService.js';

test('accepts a true/false question with exactly two answers and one correct index', () => {
  assert.equal(isValidQuestion('true_false', ['True', 'False'], 0), true);
  assert.equal(isValidQuestion('true_false', ['True', 'False'], 1), true);
});

test('rejects invalid true/false answer counts and indexes', () => {
  assert.equal(isValidQuestion('true_false', ['True'], 0), false);
  assert.equal(isValidQuestion('true_false', ['True', 'False', 'Maybe'], 0), false);
  assert.equal(isValidQuestion('true_false', ['True', 'False'], 2), false);
});

test('continues to accept four-option multiple-choice questions', () => {
  assert.equal(isValidQuestion('multiple_choice', ['A', 'B', 'C', 'D'], 3), true);
  assert.equal(isValidQuestion('multiple_choice', ['True', 'False'], 1), false);
});

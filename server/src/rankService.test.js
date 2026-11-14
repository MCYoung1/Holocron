import test from 'node:test';
import assert from 'node:assert/strict';
import { RankService } from './rankService.js';

test('calculates whole-number percentages and ranks at each threshold', () => {
  const cases = [
    [0, 100, 0, 'Youngling'],
    [39, 100, 39, 'Youngling'],
    [40, 100, 40, 'Padawan'],
    [59, 100, 59, 'Padawan'],
    [60, 100, 60, 'Jedi Knight'],
    [79, 100, 79, 'Jedi Knight'],
    [80, 100, 80, 'Jedi Master'],
    [94, 100, 94, 'Jedi Master'],
    [95, 100, 95, 'Lore Keeper'],
    [100, 100, 100, 'Lore Keeper'],
    [2, 3, 67, 'Jedi Knight'],
    [0, 0, 0, 'Youngling'],
  ];

  for (const [score, total, percentage, rank] of cases) {
    assert.deepEqual(RankService.calculate(score, total), { percentage, rank });
  }
});

test('rejects invalid scores', () => {
  assert.throws(() => RankService.calculate(-1, 10), RangeError);
  assert.throws(() => RankService.calculate(11, 10), RangeError);
  assert.throws(() => RankService.calculate(1.5, 10), RangeError);
  assert.throws(() => RankService.calculate(1, -1), RangeError);
});

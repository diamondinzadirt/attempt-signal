import assert from 'node:assert/strict';
import { calculateNewsDistribution } from '../lib/utils';

function run() {
  assert.deepEqual(calculateNewsDistribution(0), { itemsPerSymbol: 3, targetNewsCount: 6 });
  assert.deepEqual(calculateNewsDistribution(2), { itemsPerSymbol: 3, targetNewsCount: 6 });
  assert.deepEqual(calculateNewsDistribution(3), { itemsPerSymbol: 2, targetNewsCount: 6 });
  assert.deepEqual(calculateNewsDistribution(8), { itemsPerSymbol: 1, targetNewsCount: 6 });

  console.log('test-news-distribution: passed');
}

run();

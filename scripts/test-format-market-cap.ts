import assert from 'node:assert/strict';
import { formatMarketCapValue } from '../lib/utils';

function run() {
  assert.equal(formatMarketCapValue(1_250_000_000_000), '$1.25T');
  assert.equal(formatMarketCapValue(250_000_000_000), '$250.00B');
  assert.equal(formatMarketCapValue(12_500_000), '$12.50M');
  assert.equal(formatMarketCapValue(999_999), '$999999.00');
  assert.equal(formatMarketCapValue(0), 'N/A');
  assert.equal(formatMarketCapValue(Number.NaN), 'N/A');

  console.log('test-format-market-cap: passed');
}

run();

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calculatePreparation } from '../src/explore-model.ts'

test('cleaning loss is relative to gross weight and is distinct from the correction factor', () => {
  const result = calculatePreparation({ gross: 10, correction: 1.25, conversion: 1 })
  assert.equal(result.liquid, 8)
  assert.equal(result.cooked, 8)
  assert.equal(result.cleaningLoss, 2)
  assert.ok(Math.abs(result.cleaningLossPercent - 20) < 1e-10)
  assert.equal(result.cookingChange, 0)
})

test('changing cooking affects only cooked weight; stronger cleaning reduces available food', () => {
  const original = { gross: 12, correction: 1.2, conversion: 0.75 }
  const roast = calculatePreparation(original)
  const absorb = calculatePreparation({ ...original, conversion: 2.8 })
  assert.equal(roast.liquid, absorb.liquid)
  assert.equal(roast.cleaningLoss, absorb.cleaningLoss)
  assert.ok(roast.cookingChange < 0)
  assert.ok(absorb.cookingChange > 0)
  const moreCleaning = calculatePreparation({ ...original, correction: 1.5 })
  assert.ok(moreCleaning.liquid < roast.liquid)
  assert.ok(moreCleaning.cooked < roast.cooked)
  assert.ok(moreCleaning.cleaningLoss > roast.cleaningLoss)
})

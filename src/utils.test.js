import { describe, it, expect } from 'vitest';
import { isValidPublicKey, isValidAmount } from './utils.js';

describe('isValidPublicKey', () => {
  it('accepts a valid Stellar public key', () => {
    expect(isValidPublicKey('G' + 'A'.repeat(55))).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidPublicKey('not-a-key')).toBe(false);
    expect(isValidPublicKey('')).toBe(false);
    expect(isValidPublicKey(123)).toBe(false);
  });
});

describe('isValidAmount', () => {
  it('accepts positive numeric strings', () => {
    expect(isValidAmount('1.5')).toBe(true);
    expect(isValidAmount(' 10 ')).toBe(true);
  });

  it('rejects zero, negative, and empty values', () => {
    expect(isValidAmount('0')).toBe(false);
    expect(isValidAmount('-1')).toBe(false);
    expect(isValidAmount('')).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
  });
});

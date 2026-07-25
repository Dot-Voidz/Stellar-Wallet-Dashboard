import { describe, it, expect } from 'vitest';
import { isValidPublicKey, isValidSecretKey, isValidAmount } from './utils.js';

describe('isValidPublicKey', () => {
  it('accepts a G-prefixed 56-character key shape', () => {
    expect(isValidPublicKey('G' + 'A'.repeat(55))).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidPublicKey('not-a-key')).toBe(false);
    expect(isValidPublicKey('S' + 'A'.repeat(55))).toBe(false);
    expect(isValidPublicKey('')).toBe(false);
    expect(isValidPublicKey(123)).toBe(false);
  });
});

describe('isValidSecretKey', () => {
  it('accepts an S-prefixed 56-character key shape', () => {
    expect(isValidSecretKey('S' + 'A'.repeat(55))).toBe(true);
  });

  it('rejects public keys and junk', () => {
    expect(isValidSecretKey('G' + 'A'.repeat(55))).toBe(false);
    expect(isValidSecretKey('')).toBe(false);
  });
});

describe('isValidAmount', () => {
  it('accepts positive numeric strings and numbers', () => {
    expect(isValidAmount('1.5')).toBe(true);
    expect(isValidAmount(' 10 ')).toBe(true);
    expect(isValidAmount(2)).toBe(true);
  });

  it('rejects zero, negative, and empty values', () => {
    expect(isValidAmount('0')).toBe(false);
    expect(isValidAmount('-1')).toBe(false);
    expect(isValidAmount('')).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
  });
});

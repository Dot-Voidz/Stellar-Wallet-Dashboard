import { describe, it, expect } from 'vitest';
import { isValidPublicKey, isValidSecretKey, isValidAmount, isValidMemo } from './utils.js';

describe('isValidPublicKey', () => {
  it('accepts a G-prefixed 56-character key shape', () => {
    expect(isValidPublicKey('G' + 'A'.repeat(55))).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidPublicKey('not-a-key')).toBe(false);
    expect(isValidPublicKey('S' + 'A'.repeat(55))).toBe(false);
    expect(isValidPublicKey('G' + 'A'.repeat(54))).toBe(false);
    expect(isValidPublicKey('G' + 'a'.repeat(55))).toBe(false);
    expect(isValidPublicKey('')).toBe(false);
    expect(isValidPublicKey(123)).toBe(false);
    expect(isValidPublicKey(null)).toBe(false);
  });

  it('tolerates surrounding whitespace', () => {
    expect(isValidPublicKey(`  ${'G' + 'A'.repeat(55)}  `)).toBe(true);
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
    expect(isValidAmount('0.0')).toBe(false);
    expect(isValidAmount('-1')).toBe(false);
    expect(isValidAmount('')).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
    expect(isValidAmount('1.')).toBe(false);
    expect(isValidAmount('.5')).toBe(false);
    expect(isValidAmount(Infinity)).toBe(false);
    expect(isValidAmount(true)).toBe(false);
    expect(isValidAmount(null)).toBe(false);
  });
});

describe('isValidMemo', () => {
  it('treats an empty memo as optional', () => {
    expect(isValidMemo('text', '')).toBe(true);
    expect(isValidMemo('text', '   ')).toBe(true);
    expect(isValidMemo('unknown-type', '')).toBe(true);
  });

  it('validates text memos by UTF-8 byte length', () => {
    expect(isValidMemo('text', 'invoice-42')).toBe(true);
    expect(isValidMemo('text', 'a'.repeat(28))).toBe(true);
    expect(isValidMemo('text', 'a'.repeat(29))).toBe(false);
    expect(isValidMemo('text', '€'.repeat(10))).toBe(false);
  });

  it('validates id memos as unsigned 64-bit integers', () => {
    expect(isValidMemo('id', '0')).toBe(true);
    expect(isValidMemo('id', '12345')).toBe(true);
    expect(isValidMemo('id', '18446744073709551615')).toBe(true);
    expect(isValidMemo('id', '18446744073709551616')).toBe(false);
    expect(isValidMemo('id', '-1')).toBe(false);
    expect(isValidMemo('id', '1.5')).toBe(false);
    expect(isValidMemo('id', 'abc')).toBe(false);
  });

  it('validates hash and return memos as 32-byte hex', () => {
    expect(isValidMemo('hash', 'a'.repeat(64))).toBe(true);
    expect(isValidMemo('return', 'AB'.repeat(32))).toBe(true);
    expect(isValidMemo('hash', 'a'.repeat(63))).toBe(false);
    expect(isValidMemo('hash', 'z'.repeat(64))).toBe(false);
  });

  it('rejects unknown types and non-string values', () => {
    expect(isValidMemo('bogus', 'hello')).toBe(false);
    expect(isValidMemo('text', 123)).toBe(false);
    expect(isValidMemo('text', null)).toBe(false);
    expect(isValidMemo('text', undefined)).toBe(false);
  });
});

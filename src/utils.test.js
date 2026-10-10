import { describe, it, expect } from 'vitest';
import { isValidPublicKey, isValidSecretKey, isValidAmount, isValidMemo, describePaymentError, summarizeOperation } from './utils.js';

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

const horizonError = (resultCodes, { status = 400, title = 'Transaction Failed' } = {}) => ({
  response: { status, data: { title, extras: { result_codes: resultCodes } } }
});

describe('describePaymentError', () => {
  it('maps op_underfunded to an actionable message', () => {
    const result = describePaymentError(
      horizonError({ transaction: 'tx_failed', operations: ['op_underfunded'] })
    );
    expect(result.title).toBe('Payment rejected');
    expect(result.code).toBe('op_underfunded');
    expect(result.message).toMatch(/too low/i);
  });

  it('maps a missing destination account', () => {
    const result = describePaymentError(
      horizonError({ transaction: 'tx_failed', operations: ['op_no_destination'] })
    );
    expect(result.code).toBe('op_no_destination');
    expect(result.message).toMatch(/destination account/i);
  });

  it('maps an unfunded source account', () => {
    const result = describePaymentError(horizonError({ transaction: 'tx_no_source_account' }));
    expect(result.title).toBe('Payment rejected');
    expect(result.code).toBe('tx_no_source_account');
  });

  it('maps HTTP 404 to account not found', () => {
    const result = describePaymentError({ response: { status: 404, data: {} } });
    expect(result.title).toBe('Account not found');
    expect(result.code).toBe('account_not_found');
  });

  it('maps network failures with no response', () => {
    expect(describePaymentError(new TypeError('Failed to fetch')).title).toBe('Network problem');
    expect(describePaymentError({ message: 'request timed out' }).title).toBe('Network problem');
  });

  it('redacts secret keys from fallback details', () => {
    const secret = 'S' + 'A'.repeat(55);
    const result = describePaymentError({
      message: `boom ${secret}`,
      response: { status: 500, data: {} }
    });
    expect(result.message).not.toContain(secret);
    expect(result.message).toContain('[redacted secret key]');
  });

  it('falls back to a generic error for unknown input', () => {
    expect(describePaymentError(null).title).toBe('Payment failed');
    expect(describePaymentError('nope').title).toBe('Payment failed');
  });
});

const ACCOUNT = 'G' + 'A'.repeat(55);

describe('summarizeOperation', () => {
  it('summarizes an outgoing native payment', () => {
    const result = summarizeOperation(
      { type: 'payment', from: ACCOUNT, to: 'G' + 'B'.repeat(55), amount: '10.0', asset_type: 'native', transaction_successful: true },
      ACCOUNT
    );
    expect(result).toEqual({ label: 'Payment', amount: '10.0 XLM', direction: 'out', successful: true });
  });

  it('summarizes an incoming credit payment and failed status', () => {
    const result = summarizeOperation(
      { type: 'payment', from: 'G' + 'B'.repeat(55), to: ACCOUNT, amount: '5', asset_type: 'credit_alphanum4', asset_code: 'USDC', transaction_successful: false },
      ACCOUNT
    );
    expect(result.amount).toBe('5 USDC');
    expect(result.direction).toBe('in');
    expect(result.successful).toBe(false);
  });

  it('handles create_account from the funder side', () => {
    const result = summarizeOperation(
      { type: 'create_account', funder: ACCOUNT, account: 'G' + 'B'.repeat(55), starting_balance: '2.0', transaction_successful: true },
      ACCOUNT
    );
    expect(result.label).toBe('Create account');
    expect(result.amount).toBe('2.0 XLM');
    expect(result.direction).toBe('out');
  });

  it('falls back for unknown types and bad input', () => {
    expect(summarizeOperation({ type: 'manage_data' }).label).toBe('Manage data');
    expect(summarizeOperation(null).label).toBe('Operation');
    expect(summarizeOperation(undefined).successful).toBe(true);
  });
});

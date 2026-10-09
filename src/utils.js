export function isValidPublicKey(value) {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  // Stellar account IDs are 56-character base32 (G...) strings.
  return /^G[A-Z2-7]{55}$/.test(trimmed);
}

export function isValidSecretKey(value) {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  return /^S[A-Z2-7]{55}$/.test(trimmed);
}

export function isValidAmount(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0;
  }

  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    return false;
  }

  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) && numericValue > 0;
}

const MEMO_TYPES = ['text', 'id', 'hash', 'return'];
const U64_MAX = 18446744073709551615n;

export function isValidMemo(type, value) {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    // Memos are optional; an empty value means no memo is attached.
    return true;
  }

  if (!MEMO_TYPES.includes(type)) {
    return false;
  }

  switch (type) {
    case 'text':
      return new TextEncoder().encode(trimmed).length <= 28;
    case 'id':
      if (!/^\d+$/.test(trimmed)) {
        return false;
      }
      return BigInt(trimmed) <= U64_MAX;
    default:
      // hash and return are both 32-byte hex strings.
      return /^[0-9a-f]{64}$/i.test(trimmed);
  }
}

const SECRET_KEY_PATTERN = /S[A-Z2-7]{55}/g;

function redactSecrets(value) {
  return typeof value === 'string'
    ? value.replace(SECRET_KEY_PATTERN, '[redacted secret key]')
    : value;
}

const HORIZON_OPERATION_MESSAGES = {
  op_underfunded: 'Your balance is too low to cover this payment plus the network fee.',
  op_no_destination: 'The destination account does not exist on this network yet. Fund it first.',
  op_no_trust: 'The destination account does not trust the asset you are sending.',
  op_src_no_trust: 'Your account does not have a trustline for this asset.',
  op_low_reserve: 'This payment would drop your account below the minimum XLM reserve.',
  op_malformed: 'Horizon rejected the payment as malformed. Check the destination and amount.',
  op_not_authorized: 'This asset must be authorized before it can be sent.',
  op_cross_self: 'The destination is the same account you are sending from.'
};

const HORIZON_TRANSACTION_MESSAGES = {
  tx_no_source_account: 'Your account is not active on this network yet. Fund it first, then try again.',
  tx_insufficient_fee: 'The network fee was too low for current conditions. Try again.',
  tx_bad_seq: 'Your account sequence changed. Refresh balances and try again.',
  tx_too_late: 'The transaction expired before reaching the network. Try again.',
  tx_bad_auth: 'The network rejected the transaction signature.',
  tx_missing_operation: 'The transaction did not include a payment operation.'
};

function buildPaymentError(title, message, code) {
  return {
    title,
    message: redactSecrets(message),
    code: code ? redactSecrets(code) : null
  };
}

/**
 * Turn a raw Horizon/SDK payment error into a user-facing title, message, and
 * optional technical code. Never returns a secret key in any field.
 */
export function describePaymentError(error) {
  if (!error || typeof error !== 'object') {
    return buildPaymentError('Payment failed', 'The payment could not be submitted.', null);
  }

  const message = typeof error.message === 'string' ? error.message : '';
  const response = error.response;

  if (!response || /failed to fetch|\bnetwork\b|timed? ?out|timeout|load failed/i.test(message)) {
    return buildPaymentError(
      'Network problem',
      'The dashboard could not reach Horizon. Check your connection, then try again.',
      null
    );
  }

  const resultCodes = response.data?.extras?.result_codes || {};
  const operationCodes = Array.isArray(resultCodes.operations) ? resultCodes.operations : [];
  const transactionCode = resultCodes.transaction;

  const operationCode = operationCodes.find((code) => HORIZON_OPERATION_MESSAGES[code]);
  if (operationCode) {
    return buildPaymentError('Payment rejected', HORIZON_OPERATION_MESSAGES[operationCode], operationCode);
  }

  if (transactionCode && HORIZON_TRANSACTION_MESSAGES[transactionCode]) {
    return buildPaymentError('Payment rejected', HORIZON_TRANSACTION_MESSAGES[transactionCode], transactionCode);
  }

  if (response.status === 404) {
    return buildPaymentError(
      'Account not found',
      'The account is not active on this network yet. Fund it first.',
      'account_not_found'
    );
  }

  const fallback = response.data?.title || message || 'The payment could not be submitted.';
  return buildPaymentError('Payment failed', fallback, transactionCode || operationCodes[0] || null);
}

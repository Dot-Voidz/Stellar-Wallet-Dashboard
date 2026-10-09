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

/**
 * Wrap an async task with explicit idle/loading state and single-flight
 * protection. `onStart` runs when a task begins and `onFinish` always runs
 * afterwards - including when the task throws - so loading indicators can
 * never get stuck. A concurrent call while a task is in flight is ignored.
 */
export function createAsyncAction({ onStart, onFinish } = {}) {
  let running = false;

  return {
    get running() {
      return running;
    },
    get state() {
      return running ? 'loading' : 'idle';
    },
    async run(task) {
      if (running) {
        return { status: 'busy', value: undefined, error: undefined };
      }

      running = true;
      if (onStart) onStart();

      try {
        const value = await task();
        return { status: 'success', value, error: undefined };
      } catch (error) {
        return { status: 'error', value: undefined, error };
      } finally {
        running = false;
        if (onFinish) onFinish();
      }
    }
  };
}

function shortenIssuer(issuer) {
  if (typeof issuer !== 'string' || issuer.length < 10) {
    return issuer || '';
  }
  return `${issuer.slice(0, 6)}…${issuer.slice(-4)}`;
}

/**
 * Map a Horizon balance record to a selectable asset descriptor.
 * Returns null for records that cannot be turned into a payment asset.
 */
export function assetFromBalance(balance) {
  if (!balance || typeof balance !== 'object') {
    return null;
  }

  if (balance.asset_type === 'native') {
    return { code: 'XLM', issuer: null, isNative: true, label: 'XLM (native)' };
  }

  if (!balance.asset_code || !balance.asset_issuer) {
    return null;
  }

  return {
    code: balance.asset_code,
    issuer: balance.asset_issuer,
    isNative: false,
    label: `${balance.asset_code} (${shortenIssuer(balance.asset_issuer)})`
  };
}

export function assetsFromBalances(balances = []) {
  if (!Array.isArray(balances)) {
    return [];
  }
  return balances.map(assetFromBalance).filter(Boolean);
}

export function hasTrustline(balances = [], code, issuer) {
  if (!Array.isArray(balances) || !code || !issuer) {
    return false;
  }
  return balances.some((balance) => balance
    && balance.asset_code === code
    && balance.asset_issuer === issuer);
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

const OPERATION_LABELS = {
  payment: 'Payment',
  create_account: 'Create account',
  account_merge: 'Account merge',
  path_payment_strict_send: 'Path payment',
  path_payment_strict_receive: 'Path payment',
  manage_offer: 'Trade',
  create_passive_offer: 'Trade',
  set_options: 'Set options',
  change_trust: 'Change trust',
  allow_trust: 'Allow trust',
  manage_data: 'Manage data',
  bump_sequence: 'Bump sequence',
  claim_claimable_balance: 'Claim balance',
  create_claimable_balance: 'Create claimable balance'
};

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function operationAsset(operation) {
  const assetType = operation.asset_type || operation.source_asset_type;
  if (!assetType) {
    return operation.type === 'create_account' ? 'XLM' : null;
  }
  if (assetType === 'native') {
    return 'XLM';
  }
  return operation.asset_code || operation.source_asset_code || assetType;
}

function operationDirection(operation, accountId) {
  if (!accountId) {
    return 'neutral';
  }

  switch (operation.type) {
    case 'create_account':
      if (operation.funder === accountId) return 'out';
      if (operation.account === accountId) return 'in';
      return 'neutral';
    case 'account_merge':
      if (operation.account === accountId) return 'in';
      if (operation.into === accountId) return 'out';
      return 'neutral';
    default:
      if (operation.to === accountId) return 'in';
      if (operation.from === accountId) return 'out';
      if (operation.source_account === accountId) return 'out';
      return 'neutral';
  }
}

/**
 * Reduce a Horizon operation record to a display-friendly summary:
 * a human label, a formatted amount (when meaningful), the direction
 * relative to `accountId`, and whether the transaction succeeded.
 */
export function summarizeOperation(operation, accountId) {
  if (!operation || typeof operation !== 'object') {
    return { label: 'Operation', amount: null, direction: 'neutral', successful: true };
  }

  const type = typeof operation.type === 'string' ? operation.type : '';
  const label = OPERATION_LABELS[type] || (type ? type.replace(/_/g, ' ') : 'Operation');

  const rawAmount = firstDefined(operation.amount, operation.starting_balance, operation.source_amount);
  const asset = operationAsset(operation);
  const amount = rawAmount ? (asset ? `${rawAmount} ${asset}` : String(rawAmount)) : null;

  return {
    label,
    amount,
    direction: operationDirection(operation, accountId),
    successful: operation.transaction_successful !== false
  };
}

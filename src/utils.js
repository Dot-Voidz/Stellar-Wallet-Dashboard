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

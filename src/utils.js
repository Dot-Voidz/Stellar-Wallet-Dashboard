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

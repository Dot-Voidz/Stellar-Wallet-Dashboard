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

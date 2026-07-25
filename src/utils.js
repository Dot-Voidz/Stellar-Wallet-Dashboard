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

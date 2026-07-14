export function isValidPublicKey(value) {
  return typeof value === 'string' && /^[A-Z2-7]{56}$/.test(value.trim());
}

export function isValidAmount(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) && numericValue > 0;
}

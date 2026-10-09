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

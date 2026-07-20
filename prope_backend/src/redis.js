import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.REDIS_URL) {
  console.error('CRITICAL: REDIS_URL is not set in environment.');
}

export const redis = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis client successfully connected.');
});

/**
 * Obtains an atomic, distributed lock for individual transaction or operation runs.
 * @param {string} lockKey - The transaction or operation reference.
 * @param {number} durationSeconds - Expiration time in seconds (default 5 minutes).
 * @returns {Promise<boolean>} - True if lock was acquired, false if it already exists.
 */
export async function acquireLock(lockKey, durationSeconds = 300) {
  const fullKey = `lock:acrewise:${lockKey}`;
  try {
    const res = await redis.set(fullKey, 'LOCKED', 'EX', durationSeconds, 'NX');
    return res === 'OK';
  } catch (err) {
    console.error(`Failed to acquire lock for key ${lockKey}:`, err);
    return false; // Fallback to failing safe (or we could default to true depending on requirements, but failing safe is standard)
  }
}

/**
 * Releases an active lock.
 * @param {string} lockKey - The transaction or operation reference.
 * @returns {Promise<void>}
 */
export async function releaseLock(lockKey) {
  const fullKey = `lock:acrewise:${lockKey}`;
  try {
    await redis.del(fullKey);
  } catch (err) {
    console.error(`Failed to release lock for key ${lockKey}:`, err);
  }
}

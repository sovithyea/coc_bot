import Bottleneck from 'bottleneck';

// Per-user rate limiter — max 1 Claude call per 15 seconds per user
const userLimiters = new Map();

function getUserLimiter(userId) {
  if (!userLimiters.has(userId)) {
    userLimiters.set(userId, new Bottleneck({
      minTime: 15000, // 15 seconds between requests
      maxConcurrent: 1,
    }));
  }
  return userLimiters.get(userId);
}

// Global daily limit tracker
const dailyUsage = new Map();
const DAILY_LIMIT = 100; // max Claude calls per day globally

function resetDailyUsage() {
  dailyUsage.clear();
}

// Reset at midnight every day
const now = new Date();
const midnight = new Date(now);
midnight.setHours(24, 0, 0, 0);
setTimeout(() => {
  resetDailyUsage();
  setInterval(resetDailyUsage, 24 * 60 * 60 * 1000);
}, midnight - now);

export function getDailyCount() {
  return Array.from(dailyUsage.values()).reduce((a, b) => a + b, 0);
}

export async function rateLimitedClaude(userId, fn) {
  // Check daily global limit
  const total = getDailyCount();
  if (total >= DAILY_LIMIT) {
    throw new Error('DAILY_LIMIT_REACHED');
  }

  // Check per-user cooldown
  const limiter = getUserLimiter(userId);

  // Track usage
  dailyUsage.set(userId, (dailyUsage.get(userId) || 0) + 1);

  return limiter.schedule(fn);
}

export function getUserUsage(userId) {
  return dailyUsage.get(userId) || 0;
}

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

class FixedWindowRateLimiter {
  private readonly hits = new Map<string, RateLimitEntry>();

  constructor(
    private readonly limitCount: number,
    private readonly windowMs: number
  ) {}

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const current = this.hits.get(key);

    if (!current || current.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.hits.set(key, { count: 1, resetAt });

      return {
        success: true,
        limit: this.limitCount,
        remaining: this.limitCount - 1,
        reset: resetAt
      };
    }

    current.count += 1;

    return {
      success: current.count <= this.limitCount,
      limit: this.limitCount,
      remaining: Math.max(this.limitCount - current.count, 0),
      reset: current.resetAt
    };
  }
}

export const contactFormRateLimiter = new FixedWindowRateLimiter(5, 15 * 60 * 1000);

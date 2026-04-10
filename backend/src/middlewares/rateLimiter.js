const buckets = new Map();

const buildDefaultKey = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return `${ip}:${req.baseUrl || ""}:${req.path || ""}`;
};

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests. Please try again later.",
  keyGenerator = buildDefaultKey,
} = {}) => {
  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error("windowMs must be a positive number");
  }

  if (!Number.isFinite(max) || max <= 0) {
    throw new Error("max must be a positive number");
  }

  return (req, res, next) => {
    const now = Date.now();
    const key = String(keyGenerator(req) || buildDefaultKey(req));
    const entry = buckets.get(key);

    if (!entry || now >= entry.resetAt) {
      const newEntry = {
        count: 1,
        resetAt: now + windowMs,
      };
      buckets.set(key, newEntry);
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(max - 1, 0)));
      res.setHeader(
        "X-RateLimit-Reset",
        String(Math.ceil(newEntry.resetAt / 1000)),
      );
      return next();
    }

    if (entry.count >= max) {
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader(
        "X-RateLimit-Reset",
        String(Math.ceil(entry.resetAt / 1000)),
      );
      return res.status(429).json({
        message,
        retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      });
    }

    entry.count += 1;
    buckets.set(key, entry);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader(
      "X-RateLimit-Remaining",
      String(Math.max(max - entry.count, 0)),
    );
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
    return next();
  };
};

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets.entries()) {
    if (now >= entry.resetAt) {
      buckets.delete(key);
    }
  }
}, 60 * 1000).unref?.();

module.exports = { createRateLimiter };

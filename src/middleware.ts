import { NextResponse } from "next/server";

const rateLimit = new Map();
const RATE_LIMIT = 100; // Max requests
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

export function middleware(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
  const now = Date.now();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const timestamps = rateLimit.get(ip);
  timestamps.push(now);

  // Keep only timestamps within the last 15 minutes
  const windowStart = now - RATE_LIMIT_WINDOW;
  rateLimit.set(ip, timestamps.filter((timestamp: number) => timestamp > windowStart));

  if (rateLimit.get(ip).length > RATE_LIMIT) {
    const retryAfter = Math.ceil((windowStart + RATE_LIMIT_WINDOW - now) / 1000); // Time in seconds
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { error: "Too many requests, please try again later" },
      { status: 429, headers: { "Retry-After": retryAfter.toString() } }
    );
  }

  return NextResponse.next();
}

// Periodic cleanup to prevent memory bloat
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimit.entries()) {
    const filteredTimestamps = timestamps.filter((timestamp: number) => timestamp > now - RATE_LIMIT_WINDOW);
    if (filteredTimestamps.length === 0) {
      rateLimit.delete(ip);
    } else {
      rateLimit.set(ip, filteredTimestamps);
    }
  }
}, 60 * 1000); // Run cleanup every minute

export const config = {
  matcher: "/api/:path*", // Apply to all API routes
};


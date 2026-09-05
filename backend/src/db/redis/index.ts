import Redis from "ioredis";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../common/errors/ApiError";
import { ApiResponse } from "../../common/responses/ApiResponses";

export const redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6369)
});

const maxReq = 5;
const WINDOW_IN_SECONDS = 15 * 60; // 15 minutes TTL (900 seconds)

export async function ipRateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const key = `rate_limit:${ip}`;

    try {
        const count = await redisClient.incr(key);

        // Only set the TTL on the first request in the window so the window doesn't slide indefinitely
        if (count === 1) {
            await redisClient.expire(key, WINDOW_IN_SECONDS);
        }

        const ttl = await redisClient.ttl(key);

        res.setHeader("X-RateLimit-Limit", maxReq);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, maxReq - count));
        res.setHeader("X-RateLimit-Reset", ttl > 0 ? ttl : WINDOW_IN_SECONDS);

        if (count > maxReq) {
            return next(ApiError.tooManyRequests(`Too many requests. Limit is ${maxReq} requests per 15 minutes. Try again in ${ttl} seconds.`));
        }

        return next();
    } catch (err) {
        if (err instanceof ApiError) {
            return next(err);
        }
        console.error("Redis rate limiter error:", err);
        return next();
    }
}
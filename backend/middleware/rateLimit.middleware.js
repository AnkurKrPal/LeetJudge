import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisConnection from '../config/redis.js';

// rate limiting middleware using Redis
export const apiLimiter = process.env.NODE_ENV === 'test' 
    ? (req, res, next) => next() 
    : rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100', 10),
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests from this IP, please try again later' },
        store: new RedisStore({
            // @ts-expect-error - Known issue with @types/ioredis
            sendCommand: (...args) => redisConnection.call(...args),
            prefix: 'rl_global:',
        }),
    });

// Stricter rate limiter for sensitive routes like auth or submissions
export const strictLimiter = process.env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS || '300000', 10),
        max: parseInt(process.env.RATE_LIMIT_STRICT_MAX || '20', 10),
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests, please try again later' },
        store: new RedisStore({
            // @ts-expect-error
            sendCommand: (...args) => redisConnection.call(...args),
            prefix: 'rl_strict:',
        }),
    });
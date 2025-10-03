import { Redis } from "@upstash/redis";
import { env } from "../config/env.ts";
import { RedisStore } from "@hono-rate-limiter/redis";
import { rateLimiter } from "hono-rate-limiter";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const store = new RedisStore({ client: redis });

export const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "", // Method to generate custom identifiers for clients.
  store,
  message: "Too many requests, please try again later.",
});

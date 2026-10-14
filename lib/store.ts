import "server-only";
import { Redis } from "@upstash/redis";

/**
 * Tiny key/value + hash store used by live games.
 *
 * - On Vercel: connect an Upstash Redis database (Vercel Marketplace → Upstash),
 *   which sets KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL / _TOKEN).
 * - Locally without those env vars: an in-memory store (single process only).
 */
export interface Store {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec: number): Promise<void>;
  /** Set only if the key does not exist. Returns true if it was set. */
  setNx(key: string, value: string, ttlSec: number): Promise<boolean>;
  hset(key: string, field: string, value: string, ttlSec: number): Promise<void>;
  /** Set a hash field only if absent. Returns true if it was set. */
  hsetNx(key: string, field: string, value: string, ttlSec: number): Promise<boolean>;
  hget(key: string, field: string): Promise<string | null>;
  hgetall(key: string): Promise<Record<string, string>>;
  hincrby(key: string, field: string, by: number, ttlSec: number): Promise<number>;
  hlen(key: string): Promise<number>;
}

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

function redisStore(redis: Redis): Store {
  return {
    async get(key) {
      return (await redis.get<string>(key)) ?? null;
    },
    async set(key, value, ttl) {
      await redis.set(key, value, { ex: ttl });
    },
    async setNx(key, value, ttl) {
      return (await redis.set(key, value, { ex: ttl, nx: true })) === "OK";
    },
    async hset(key, field, value, ttl) {
      const p = redis.pipeline();
      p.hset(key, { [field]: value });
      p.expire(key, ttl);
      await p.exec();
    },
    async hsetNx(key, field, value, ttl) {
      const p = redis.pipeline();
      p.hsetnx(key, field, value);
      p.expire(key, ttl);
      const [added] = await p.exec<[number, number]>();
      return added === 1;
    },
    async hget(key, field) {
      return (await redis.hget<string>(key, field)) ?? null;
    },
    async hgetall(key) {
      return ((await redis.hgetall<Record<string, string>>(key)) ?? {}) as Record<string, string>;
    },
    async hincrby(key, field, by, ttl) {
      const p = redis.pipeline();
      p.hincrby(key, field, by);
      p.expire(key, ttl);
      const [n] = await p.exec<[number, number]>();
      return n;
    },
    async hlen(key) {
      return redis.hlen(key);
    },
  };
}

type Entry = { value: string | Map<string, string>; expires: number };

function memoryStore(): Store {
  const g = globalThis as unknown as { __quizMem?: Map<string, Entry> };
  const mem = (g.__quizMem ??= new Map());
  const live = (key: string) => {
    const e = mem.get(key);
    if (e && e.expires < Date.now()) {
      mem.delete(key);
      return undefined;
    }
    return e;
  };
  const hash = (key: string, ttl: number) => {
    let e = live(key);
    if (!e || typeof e.value === "string") {
      e = { value: new Map(), expires: 0 };
      mem.set(key, e);
    }
    e.expires = Date.now() + ttl * 1000;
    return e.value as Map<string, string>;
  };
  return {
    async get(key) {
      const e = live(key);
      return e && typeof e.value === "string" ? e.value : null;
    },
    async set(key, value, ttl) {
      mem.set(key, { value, expires: Date.now() + ttl * 1000 });
    },
    async setNx(key, value, ttl) {
      if (live(key)) return false;
      mem.set(key, { value, expires: Date.now() + ttl * 1000 });
      return true;
    },
    async hset(key, field, value, ttl) {
      hash(key, ttl).set(field, value);
    },
    async hsetNx(key, field, value, ttl) {
      const h = hash(key, ttl);
      if (h.has(field)) return false;
      h.set(field, value);
      return true;
    },
    async hget(key, field) {
      const e = live(key);
      return e && typeof e.value !== "string" ? (e.value.get(field) ?? null) : null;
    },
    async hgetall(key) {
      const e = live(key);
      return e && typeof e.value !== "string" ? Object.fromEntries(e.value) : {};
    },
    async hincrby(key, field, by, ttl) {
      const h = hash(key, ttl);
      const n = Number(h.get(field) ?? 0) + by;
      h.set(field, String(n));
      return n;
    },
    async hlen(key) {
      const e = live(key);
      return e && typeof e.value !== "string" ? e.value.size : 0;
    },
  };
}

export const usingRedis = Boolean(url && token);

export const store: Store = usingRedis
  ? redisStore(new Redis({ url: url!, token: token!, automaticDeserialization: false }))
  : memoryStore();

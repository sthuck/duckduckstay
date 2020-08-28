import { SearchResults } from "./searchEs";
import { createHash } from "crypto";
import * as redis from "redis";

const SEARCH_CACHE_TTL = 4 * 60 * 60;

export async function searchCache(redisClient: redis.RedisClient, query: string): Promise<SearchResults<{}> | null> {
    const key = searchQueryHash(query);
    const results = await redisGET(redisClient, key);

    if (results === null) {
        return null;
    }

    return JSON.parse(results);
}

export async function cacheResults(redisClient: redis.RedisClient, query: string, results: SearchResults<{}>): Promise<void> {
    const key = searchQueryHash(query);
    await redisSET(redisClient, key, JSON.stringify(results), SEARCH_CACHE_TTL);
}

// --------

export function searchQueryHash(query: string): string {
    const sha1Hash = createHash('sha1');
    return sha1Hash.update(query).digest("hex");
}

async function redisSET(redisClient: redis.RedisClient, key: string, value: string, expireSeconds: number): Promise<"OK"> {
    return await new Promise<"OK">((resolve, reject) => {
        redisClient.set(key, value, "EX", expireSeconds, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}

async function redisGET(redisClient: redis.RedisClient, key: string): Promise<string | null> {
    return await new Promise<string | null>((resolve, reject) => {
        redisClient.get(key, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}

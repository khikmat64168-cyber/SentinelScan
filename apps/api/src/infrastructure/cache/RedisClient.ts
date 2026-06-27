import Redis from 'ioredis';

let _redis: Redis | undefined;

export function getRedis(url: string): Redis {
  if (!_redis) {
    _redis = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
  }
  return _redis;
}

export async function checkRedisHealth(redis: Redis): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit();
    _redis = undefined;
  }
}

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.logger.redis('✅ Redis connection established');
  }

  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.redis('❌ Redis connection closed');
  }

  // --------------------------
  // Wrapper methods
  // --------------------------

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.redis.publish(channel, message);
  }

  async subscribe(
    channel: string,
    listener: (message: string) => void,
  ): Promise<void> {
    const sub = this.redis.duplicate(); // create a dedicated connection
    await sub.subscribe(channel);
    sub.on('message', (ch, msg) => {
      if (ch === channel) listener(msg);
    });
  }
}

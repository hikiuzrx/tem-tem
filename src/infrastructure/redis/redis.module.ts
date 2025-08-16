import { Module } from '@nestjs/common';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { LoggerService } from '../logger/logger.service';
import { redisConfig } from '../../config/redis.config';

@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [LoggerService],
      useFactory: (logger: LoggerService): RedisModuleOptions => ({
        ...(redisConfig(logger) as RedisModuleOptions),
      }),
    }),
  ],
})
export class CacheModule {}

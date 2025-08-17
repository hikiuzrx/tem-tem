import { Global, Module } from '@nestjs/common';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { LoggerService } from '../logger/logger.service';
import { redisConfig } from '../../config/redis.config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [LoggerService],
      useFactory: (logger: LoggerService): RedisModuleOptions => {
        const config = redisConfig(logger);
        return {
          type: 'single',
          url: `redis://${config.host}:${config.port}`,
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class CacheModule {}

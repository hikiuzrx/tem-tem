import { constants } from '../shared/constants';
import { LoggerService } from '../infrastructure/logger/logger.service';
import { RedisOptions } from 'ioredis';

export const redisConfig = (logger: LoggerService): RedisOptions => {
  logger.redis(
    `Connecting to Redis at ${constants.REDIS_HOST}:${constants.REDIS_PORT}`,
  );

  return {
    host: constants.REDIS_HOST,
    port: Number(constants.REDIS_PORT),
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(
        `Retrying Redis connection (attempt ${times}) in ${delay}ms`,
        'Redis',
      );
      return delay;
    },
  };
};

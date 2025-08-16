import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerService } from '../logger/logger.service';
import { dbConfig } from '../../config/db.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [LoggerService],
      useFactory: (logger: LoggerService) => dbConfig(logger),
    }),
  ],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/db.module';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from './infrastructure/logger/logger.module';
@Module({
  imports: [DatabaseModule, CacheModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

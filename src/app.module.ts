import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { constants } from './shared/constants';
import { DatabaseModule } from './infrastructure/database/db.module';
import { CacheModule } from './infrastructure/redis/redis.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/categories/catgeory.module';
import { ProductModule } from './modules/products/product.module';
@Module({
  imports: [
    MongooseModule.forRoot(constants.DB_CONNECTION),
    DatabaseModule,
    CacheModule,
    LoggerModule,
    AuthModule,
    CategoryModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

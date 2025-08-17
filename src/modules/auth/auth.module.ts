import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';

import { constants } from '../../shared/constants';
import { CacheModule } from '../../infrastructure/redis/redis.module';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './schema/user.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: constants.JWT_SECRET,
      signOptions: { expiresIn: constants.JWT_EXPIRES_IN },
    }),
    CacheModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

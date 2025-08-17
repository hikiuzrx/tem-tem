import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import argon2 from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { publicUser } from 'src/types/models';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async sign(payload: Record<string, any>, options?: object): Promise<string> {
    return this.jwtService.signAsync(payload, options);
  }

  async verify(token: string, options?: object): Promise<any> {
    return this.jwtService.verifyAsync(token, options);
  }

  async register(
    user: RegisterDto,
  ): Promise<{ user: publicUser; token: string }> {
    const existingUser = await this.userModel.findOne({ email: user.email });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await this.hashPassword(user.password);
    const newUser = await this.userModel.create({
      ...user,
      password: hashedPassword,
    });
    const token = await this.sign({ sub: newUser._id });
    const publicUser: publicUser = {
      id: newUser._id as string,
      email: newUser.email,
      username: newUser.username,
    };
    return { user: publicUser, token };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: publicUser; token: string }> {
    const user = await this.userModel.findOne({
      email: email,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await argon2.verify(user.password, password))) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = await this.sign({ sub: user._id });
    const publicUser: publicUser = {
      id: user._id as string,
      email: user.email,
      username: user.username,
    };
    return { user: publicUser, token };
  }
  async logout(token: string, ttlSeconds: number) {
    const blacklistKey = `jwt_blacklist:${token}`;
    await this.redisService.set(blacklistKey, 'revoked', ttlSeconds);
  }
  async isTokenRevoked(token: string): Promise<boolean> {
    const blacklistKey = `jwt_blacklist:${token}`;
    const exists = await this.redisService.get(blacklistKey);
    return !!exists;
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }
}

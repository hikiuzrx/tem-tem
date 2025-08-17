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
import { LoginDto } from './dto/login.dto';

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
    const token = await this.sign({ sub: newUser._id, role: newUser.role });
    const publicUser: publicUser = {
      id: newUser._id as string,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    };
    return { user: publicUser, token };
  }

  async login(dto: LoginDto): Promise<{ user: publicUser; token: string }> {
    const user = await this.userModel.findOne({
      email: dto.email,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await argon2.verify(user.password, dto.password))) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = await this.sign({ sub: user._id, role: user.role });
    const publicUser: publicUser = {
      id: user._id as string,
      email: user.email,
      username: user.username,
      role: user.role,
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
  async requestPasswordReset(
    email: string,
  ): Promise<{ userId: string; code: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit code
    const cacheKey = `reset_code:${user._id as string}`;
    await this.redisService.set(cacheKey, code, 120); // 2 min TTL
    // In real app, send code via email/SMS here
    return { userId: user._id as string, code };
  }

  async confirmPasswordReset(
    userId: string,
    code: string,
    newPassword: string,
  ): Promise<boolean> {
    const cacheKey = `reset_code:${userId}`;
    const cachedCode = await this.redisService.get(cacheKey);
    if (!cachedCode || cachedCode !== code) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.password = await this.hashPassword(newPassword);
    await user.save();
    await this.redisService.del(cacheKey);
    return true;
  }
}

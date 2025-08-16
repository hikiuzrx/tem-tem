import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: Record<string, any>, options?: object): Promise<string> {
    return this.jwtService.signAsync(payload, options);
  }

  async verify(token: string, options?: object): Promise<any> {
    return this.jwtService.verifyAsync(token, options);
  }

  async register(user: RegisterDto): Promise<void> {
    // Registration logic here
  }
  async login(email: string, password: string): Promise<void> {
    // Login logic here
  }
  async logout(userId: string): Promise<void> {
    // Logout logic here
  }
}

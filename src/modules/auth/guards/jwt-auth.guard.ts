import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { AuthRequest, JwtPayload } from 'src/types/jwt';
import { constants } from '../../../shared/constants';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest<Request>();
    const cookies = (request.cookies ?? {}) as { [key: string]: string };
    const token =
      cookies['auth_token'] ||
      (request.headers['authorization']?.split(' ')[1] as string);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: constants.JWT_SECRET,
      });

      const revoked = await this.authService.isTokenRevoked(token);
      if (revoked) {
        throw new UnauthorizedException('Token has been revoked');
      }

      request.user = payload;
      return true;
    } catch (error) {
      this.logger.auth('failed auth', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

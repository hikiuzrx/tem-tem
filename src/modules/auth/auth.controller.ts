/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { constants } from '../../shared/constants';
import { Public } from './decorators/isPublic.decorator';
import {
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  UseInterceptors,
  Body,
  Response,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoggingInterceptor } from 'src/infrastructure/logger/logger.interceptor';
import { Roles } from './decorators/roles.decorator';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: RegisterDto, @Response() res) {
    try {
      const { user, token } = await this.authService.register(dto);
      res.cookie('auth_token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: constants.NODE_ENV === 'production' ? true : false,
        maxAge: 60 * 60 * 1000,
      });
      res.status(201).json({ success: true, content: user });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User already exists');
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in' })
  @ApiResponse({ status: 409, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Response() res) {
    try {
      const { user, token } = await this.authService.login(dto);
      res.cookie('auth_token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: constants.NODE_ENV === 'production' ? true : false,
        maxAge: 60 * 60 * 1000,
      });
      res.status(200).json({ success: true, content: user });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Invalid credentials');
      }
      throw new InternalServerErrorException('Login failed');
    }
  }
  @Roles()
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out' })
  async logout(@Request() req, @Response() res) {
    res.clearCookie('auth_token');
    const token = req.cookies['auth_token'] as string;
    await this.authService.logout(token, 3600);
    res.clearCookie('auth_token');
    res.status(200).json({ success: true });
  }

  @Public()
  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset code' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Reset code sent' })
  async requestPasswordReset(@Body('email') email: string, @Response() res) {
    try {
      const result = await this.authService.requestPasswordReset(email);
      // In production, do not return the code in the response!
      res
        .status(200)
        .json({ success: true, userId: result.userId, code: result.code });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          (error as Error)?.message || 'Failed to request password reset',
      });
    }
  }

  @Public()
  @Post('confirm-password-reset')
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiBody({
    schema: {
      properties: {
        userId: { type: 'string', example: 'userId' },
        code: { type: 'string', example: '12345' },
        newPassword: { type: 'string', example: 'newPassword123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async confirmPasswordReset(
    @Body('userId') userId: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
    @Response() res,
  ) {
    try {
      await this.authService.confirmPasswordReset(userId, code, newPassword);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error)?.message || 'Failed to reset password',
      });
    }
  }
}

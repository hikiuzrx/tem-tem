import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: Record<string, any>;
  }
}

export const User = createParamDecorator(
  (data: string | number | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as Record<string, unknown> | undefined;
    if (typeof data === 'string' || typeof data === 'number') {
      return user?.[data];
    }
    return user;
  },
);

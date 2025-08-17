import { Request } from 'express';
export interface JwtPayload {
  sub: string;
  role: 'user' | 'admin';
}
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

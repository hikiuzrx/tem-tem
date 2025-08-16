/* eslint-disable @typescript-eslint/no-unsafe-call */
import 'reflect-metadata';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../modules/auth/schema/user.schema';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  const existing = await userModel.findOne({ email: 'tem-tem@admin.com' });
  if (existing) {
    console.log('Admin user already exists.');
    await app.close();
    return;
  }

  const hashedPassword = await argon2.hash('admin1234');
  await userModel.create({
    username: 'tem-tem',
    email: 'tem-tem@admin.com',
    password: hashedPassword,
    role: 'admin',
  });
  console.log('Admin user created.');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Seeder error:', err);
  process.exit(1);
});

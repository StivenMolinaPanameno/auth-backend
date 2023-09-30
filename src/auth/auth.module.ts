import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[MongooseModule.forFeature([{name: User.name, schema:UserSchema,} ]),

  ConfigModule.forRoot(),
  JwtModule.register({
    global: true,
    secret: process.env.JWT_SEED,
    signOptions: { expiresIn: '6h' },
  }),
],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

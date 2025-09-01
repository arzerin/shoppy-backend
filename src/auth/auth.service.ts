import { Injectable, UnauthorizedException } from '@nestjs/common';
import ms from 'ms';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(user: User, response: Response) {

    function toMs(raw: string): number {
      // If it's all digits, treat as seconds (common env pattern like "3600")
      if (/^\d+$/.test(raw)) return Number(raw) * 1000;

      // Otherwise let `ms` parse strings like "15m", "1h", "7d"
      const v = (ms as unknown as (v: string) => number)(raw);
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        throw new Error(`Invalid JWT_EXPIRATION: ${raw}`);
      }
      return v;
    }

    const expStr = this.config.getOrThrow<string>('JWT_EXPIRATION'); // e.g. "1h"
    const token = this.jwt.sign(
      { userId: user.id },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: expStr, // ← pass the string directly
      },
    );
    const deltaMs = toMs(expStr);

    const expires = new Date(Date.now() + deltaMs); // for cookie

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    


    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires,
    });

    return { tokenPayload };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });
      const authenticated = await bcrypt.compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
}

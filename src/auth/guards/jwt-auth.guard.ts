import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, _context: any, _status?: any) {
    console.log('JwtAuthGuard.handleRequest ->', { err, user, info }); // DEBUG
    if (err || !user) throw err || new UnauthorizedException();
    return user;
  }
}

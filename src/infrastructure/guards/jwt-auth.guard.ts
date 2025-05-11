import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../logger/logger.service'; // Importa LoggerService

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly loggerService: LoggerService) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    this.loggerService.log('JwtAuthGuard - Handling request...');
    if (err || !user) {
      this.loggerService.warn(`JwtAuthGuard - Authentication failed: ${info}`);
      throw err || new UnauthorizedException();
    }
    this.loggerService.debug(`JwtAuthGuard - Authentication successful for user ID: ${user.sub}`);
    return user;
  }
}
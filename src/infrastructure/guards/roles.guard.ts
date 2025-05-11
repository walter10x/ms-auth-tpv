import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { LoggerService } from '../logger/logger.service'; // Importa LoggerService

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly loggerService: LoggerService, // Inyecta LoggerService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.loggerService.debug(`RolesGuard - Required roles: ${requiredRoles}`);

    if (!requiredRoles || requiredRoles.length === 0) {
      this.loggerService.debug('RolesGuard - No roles required, allowing access');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    this.loggerService.debug(`RolesGuard - User roles: ${user?.roles}`);

    const hasAnyRole = requiredRoles.some(role => user?.roles?.includes(role));

    if (hasAnyRole) {
      this.loggerService.log(`RolesGuard - User has one of the required roles (${requiredRoles}), allowing access`);
      return true;
    } else {
      this.loggerService.warn(`RolesGuard - User does not have any of the required roles (${requiredRoles}), denying access`);
      return false;
    }
  }
}
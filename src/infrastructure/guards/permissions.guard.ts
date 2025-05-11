import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { hasPermission } from '../../domain/constants/permissions';
import { LoggerService } from '../logger/logger.service'; // Importa LoggerService

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly loggerService: LoggerService, // Inyecta LoggerService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.loggerService.debug(`PermissionsGuard - Required permissions: ${requiredPermissions}`);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.loggerService.debug('PermissionsGuard - No permissions required, allowing access');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    this.loggerService.debug(`PermissionsGuard - User roles: ${user?.roles}`);

    const hasAllPermissions = requiredPermissions.every(permission =>
      hasPermission(user?.roles, permission),
    );

    if (hasAllPermissions) {
      this.loggerService.log('PermissionsGuard - User has all required permissions, allowing access');
      return true;
    } else {
      this.loggerService.warn(`PermissionsGuard - User does not have all required permissions (${requiredPermissions}), denying access`);
      return false;
    }
  }
}
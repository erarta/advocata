import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_ROLES_KEY, AdminRole } from '../decorators/admin-roles.decorator';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Check if user is authenticated
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific roles required, just check if user has any admin role
    if (!requiredRoles || requiredRoles.length === 0) {
      return this.isAdminUser(user);
    }

    // Check if user has one of the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions for this operation');
    }

    return true;
  }

  private isAdminUser(user: any): boolean {
    const adminRoles: AdminRole[] = [
      'super_admin',
      'admin',
      'support',
      'analyst',
      'content_manager',
    ];

    if (!adminRoles.includes(user.role)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

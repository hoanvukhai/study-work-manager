import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/** Dùng sau JwtAuthGuard: chỉ cho qua người dùng có vai trò được khai báo bằng @Roles(...). */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as { role?: string } | undefined;
    if (!user?.role || !required.includes(user.role)) {
      throw new ForbiddenException('Bạn không có quyền truy cập khu vực này');
    }
    return true;
  }
}

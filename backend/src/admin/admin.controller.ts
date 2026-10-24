import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { BroadcastDto, ListUsersDto } from './dto/admin.dto';
import { Roles, RolesGuard } from './roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers(@Query() q: ListUsersDto) {
    return this.adminService.listUsers(q.search, q.page ?? 1, q.pageSize ?? 20);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('users/:id/lock')
  lock(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.setLocked(adminId, id, true);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('users/:id/unlock')
  unlock(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.setLocked(adminId, id, false);
  }

  @Get('stats')
  stats() {
    return this.adminService.getStats();
  }

  @Post('broadcast')
  broadcast(@CurrentUser('id') adminId: string, @Body() dto: BroadcastDto) {
    return this.adminService.broadcast(adminId, dto.title, dto.message);
  }

  @Get('audit-logs')
  auditLogs() {
    return this.adminService.listAuditLogs();
  }
}

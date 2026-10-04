import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RelationsService } from './relations.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('relations')
@UseGuards(JwtAuthGuard)
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateRelationDto) {
    return this.relationsService.create(userId, dto);
  }

  @Get('object/:objectId')
  findByObjectId(
    @CurrentUser('id') userId: string,
    @Param('objectId', ParseUUIDPipe) objectId: string,
  ) {
    return this.relationsService.findByObjectId(userId, objectId);
  }

  @Delete(':id')
  remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.relationsService.remove(userId, id);
  }
}

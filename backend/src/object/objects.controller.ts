import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { QueryObjectsDto } from './dto/query-objects.dto';
import { LifecycleActionDto } from './dto/lifecycle-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('objects')
@UseGuards(JwtAuthGuard)
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateObjectDto) {
    return this.objectsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: QueryObjectsDto) {
    return this.objectsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.objectsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateObjectDto,
  ) {
    return this.objectsService.update(userId, id, dto);
  }

  @Patch(':id/lifecycle')
  updateLifecycle(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LifecycleActionDto,
  ) {
    return this.objectsService.updateLifecycle(userId, id, dto.action);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.objectsService.remove(userId, id);
  }

  @Post(':id/spaces/:spaceId')
  attachToSpace(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) objectId: string,
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
  ) {
    return this.objectsService.attachToSpace(userId, spaceId, objectId);
  }

  @Delete(':id/spaces/:spaceId')
  removeFromSpace(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) objectId: string,
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
  ) {
    return this.objectsService.removeFromSpace(userId, spaceId, objectId);
  }
}

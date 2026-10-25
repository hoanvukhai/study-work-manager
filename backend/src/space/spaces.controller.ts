import {
  Controller, Get, Post, Patch, Delete, HttpCode, HttpStatus,
  Body, Param, Query, UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto, CreateFromTemplateDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { ReorderDto, UpdatePlacementDto } from './dto/placement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('spaces')
@UseGuards(JwtAuthGuard)
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateSpaceDto) {
    return this.spacesService.create(userId, dto);
  }

  @Get('templates')
  listTemplates() {
    return this.spacesService.listTemplates();
  }

  @Post('from-template')
  createFromTemplate(@CurrentUser('id') userId: string, @Body() dto: CreateFromTemplateDto) {
    return this.spacesService.createFromTemplate(userId, dto.templateId, {
      name: dto.name,
      icon: dto.icon,
      color: dto.color,
      description: dto.description,
    });
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.spacesService.findAll(userId, includeArchived === 'true');
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.spacesService.getWithProgress(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpaceDto,
  ) {
    return this.spacesService.update(userId, id, dto);
  }

  @Patch(':spaceId/objects/:objectId')
  updatePlacement(
    @CurrentUser('id') userId: string,
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Param('objectId', ParseUUIDPipe) objectId: string,
    @Body() dto: UpdatePlacementDto,
  ) {
    return this.spacesService.updatePlacement(userId, spaceId, objectId, dto);
  }

  @Post(':id/reorder')
  @HttpCode(HttpStatus.OK)
  reorder(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderDto,
  ) {
    return this.spacesService.reorder(userId, id, dto.objectIds);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.spacesService.remove(userId, id);
  }
}


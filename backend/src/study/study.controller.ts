import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { StudyService } from './study.service';
import { CreateSessionDto, DueQueryDto, ReviewCardDto } from './dto/study.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('study')
@UseGuards(JwtAuthGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @HttpCode(HttpStatus.OK)
  @Post('notes/:objectId/sync-cards')
  syncCards(@CurrentUser('id') userId: string, @Param('objectId', ParseUUIDPipe) objectId: string) {
    return this.studyService.syncCards(userId, objectId);
  }

  @Get('notes/:objectId/cards')
  listCards(@CurrentUser('id') userId: string, @Param('objectId', ParseUUIDPipe) objectId: string) {
    return this.studyService.listCardsOfNote(userId, objectId);
  }

  @Get('due')
  getDue(@CurrentUser('id') userId: string, @Query() query: DueQueryDto) {
    return this.studyService.getDue(userId, query.limit ?? 20);
  }

  @HttpCode(HttpStatus.OK)
  @Post('cards/:id/review')
  review(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewCardDto,
  ) {
    return this.studyService.review(userId, id, dto.grade);
  }

  @Post('sessions')
  createSession(@CurrentUser('id') userId: string, @Body() dto: CreateSessionDto) {
    return this.studyService.createSession(userId, dto.minutes, dto.objectId);
  }

  @Get('stats')
  getStats(@CurrentUser('id') userId: string) {
    return this.studyService.getStats(userId);
  }
}

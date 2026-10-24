import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IsOptional, IsUUID } from 'class-validator';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

class GraphQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'Mã Không gian không hợp lệ' })
  spaceId?: string;
}

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('graph')
  getGraph(@CurrentUser('id') userId: string, @Query() query: GraphQueryDto) {
    return this.knowledgeService.getGraph(userId, query.spaceId);
  }
}

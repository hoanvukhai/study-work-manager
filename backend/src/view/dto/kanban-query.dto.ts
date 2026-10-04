import { IsOptional, IsUUID } from 'class-validator';

export class KanbanQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'Mã Không gian không hợp lệ' })
  spaceId?: string;
}

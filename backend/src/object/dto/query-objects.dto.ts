import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { ObjectType, TaskStatus, Priority, ObjectLifecycle } from '@prisma/client';

export class QueryObjectsDto {
  @IsOptional()
  @IsUUID('4', { message: 'Mã Không gian không hợp lệ' })
  spaceId?: string;

  @IsOptional()
  @IsEnum(ObjectType, { message: 'Loại đối tượng không hợp lệ' })
  type?: ObjectType;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Trạng thái không hợp lệ' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority, { message: 'Mức độ ưu tiên không hợp lệ' })
  priority?: Priority;

  @IsOptional()
  @IsEnum(ObjectLifecycle, { message: 'Vòng đời không hợp lệ' })
  lifecycle?: ObjectLifecycle;

  @IsOptional()
  @IsString()
  search?: string;
}

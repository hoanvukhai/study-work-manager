import { IsString, IsOptional, IsEnum, MaxLength, IsDateString } from 'class-validator';
import { ObjectType, TaskStatus, Priority, ObjectLifecycle } from '@prisma/client';

export class UpdateObjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Trạng thái không hợp lệ' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority, { message: 'Mức độ ưu tiên không hợp lệ' })
  priority?: Priority;

  @IsOptional()
  @IsDateString({}, { message: 'Hạn chót phải đúng định dạng ngày tháng' })
  dueDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Thời gian bắt đầu phải đúng định dạng ngày tháng' })
  startAt?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Thời gian kết thúc phải đúng định dạng ngày tháng' })
  endAt?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  metadata?: any;
}

import { ValidateNested, IsInt, Min, Max, IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { RecurrenceDto } from './recurrence.dto';
import { ObjectType, TaskStatus, Priority } from '@prisma/client';

export class CreateObjectDto {
  @IsEnum(ObjectType, { message: 'Loại đối tượng phải là TASK, NOTE, EVENT hoặc REFERENCE' })
  type: ObjectType;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  title: string;

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
  @IsInt({ message: 'Thời gian ước lượng phải là số phút (số nguyên)' })
  @Min(1)
  @Max(10080)
  estimatedMinutes?: number;

  @IsOptional()
  @IsUUID('4', { message: 'Mã Không gian không hợp lệ' })
  spaceId?: string;

  /** Luật lặp lại (chỉ Task có hạn chót / Event có giờ bắt đầu). null = bỏ lặp. */
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceDto)
  recurrence?: RecurrenceDto | null;

  @IsOptional()
  metadata?: any;
}

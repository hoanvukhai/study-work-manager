import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListNotificationsDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsInt({ message: 'Thời gian nhắc trước phải là số phút' })
  @Min(5, { message: 'Nhắc trước tối thiểu 5 phút' })
  @Max(10080, { message: 'Nhắc trước tối đa 7 ngày' })
  remindBeforeMinutes?: number;

  @IsOptional()
  @IsBoolean()
  quietHoursEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  quietStartMinute?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  quietEndMinute?: number;

  @IsOptional()
  @IsBoolean()
  enableDeadline?: boolean;

  @IsOptional()
  @IsBoolean()
  enableOverdue?: boolean;

  @IsOptional()
  @IsBoolean()
  enableEvent?: boolean;

  @IsOptional()
  @IsBoolean()
  enableDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  enableStudy?: boolean;

  @IsOptional()
  @IsBoolean()
  enableUnblocked?: boolean;
}

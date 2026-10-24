import { IsString, IsOptional, MaxLength, IsBoolean, IsDateString } from 'class-validator';

export class UpdateSpaceDto {
  @IsOptional()
  @IsString({ message: 'Tên Không gian phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên Không gian tối đa 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  settings?: any;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Hạn chót phải đúng định dạng ngày tháng' })
  dueDate?: string;
}

import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListUsersDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}

export class BroadcastDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MaxLength(120, { message: 'Tiêu đề tối đa 120 ký tự' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @MaxLength(1000, { message: 'Nội dung tối đa 1000 ký tự' })
  message: string;
}

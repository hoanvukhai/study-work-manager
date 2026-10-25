import { IsString, IsNotEmpty, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreateSpaceDto {
  @IsString({ message: 'Tên Không gian phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên Không gian không được để trống' })
  @MaxLength(100, { message: 'Tên Không gian tối đa 100 ký tự' })
  name: string;

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
  settings?: any;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Hạn chót phải đúng định dạng ngày tháng' })
  dueDate?: string;
}

export class CreateFromTemplateDto {
  @IsString({ message: 'Mã mẫu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Phải chọn một mẫu' })
  templateId: string;

  /** Tên tuỳ chọn; bỏ trống thì dùng tên của mẫu. */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Tên Không gian tối đa 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewCardDto {
  @IsIn(['AGAIN', 'HARD', 'GOOD', 'EASY'], { message: 'Mức chấm phải là AGAIN, HARD, GOOD hoặc EASY' })
  grade: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
}

export class CreateSessionDto {
  @IsInt({ message: 'Số phút phải là số nguyên' })
  @Min(1, { message: 'Phiên học tối thiểu 1 phút' })
  @Max(240, { message: 'Phiên học tối đa 240 phút' })
  minutes: number;

  @IsOptional()
  @IsUUID('4', { message: 'Mã mục không hợp lệ' })
  objectId?: string;
}

export class DueQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

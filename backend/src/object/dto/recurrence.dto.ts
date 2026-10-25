import { IsDateString, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class RecurrenceDto {
  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY'], { message: 'Kiểu lặp phải là DAILY, WEEKLY hoặc MONTHLY' })
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @IsInt({ message: 'Khoảng lặp phải là số nguyên' })
  @Min(1, { message: 'Khoảng lặp tối thiểu là 1' })
  @Max(52, { message: 'Khoảng lặp tối đa là 52' })
  interval: number;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc lặp phải đúng định dạng ngày tháng' })
  until?: string | null;
}

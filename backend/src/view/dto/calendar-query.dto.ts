import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CalendarQueryDto {
  @IsOptional()
  @IsDateString({}, { message: 'Từ ngày phải đúng định dạng ngày tháng' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Đến ngày phải đúng định dạng ngày tháng' })
  to?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Mã Không gian không hợp lệ' })
  spaceId?: string;
}

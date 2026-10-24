import { ArrayMaxSize, ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class UpdatePlacementDto {
  @IsOptional()
  @IsBoolean({ message: 'isPinned phải là true hoặc false' })
  isPinned?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  position?: number;
}

export class ReorderDto {
  @IsArray()
  @ArrayMaxSize(1000)
  @ArrayUnique()
  @IsUUID('4', { each: true, message: 'Mã mục không hợp lệ' })
  objectIds: string[];
}

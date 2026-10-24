import { IsEnum } from 'class-validator';
import { ObjectType } from '@prisma/client';

export class ConvertTypeDto {
  @IsEnum(ObjectType, { message: 'Loại đối tượng chuyển đổi không hợp lệ' })
  targetType: ObjectType;
}

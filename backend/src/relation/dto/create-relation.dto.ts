import { IsUUID, IsEnum, IsNotEmpty } from 'class-validator';
import { RelationType } from '@prisma/client';

export class CreateRelationDto {
  @IsUUID('4', { message: 'Mã đối tượng nguồn không hợp lệ' })
  @IsNotEmpty({ message: 'Đối tượng nguồn không được để trống' })
  fromObjectId: string;

  @IsUUID('4', { message: 'Mã đối tượng đích không hợp lệ' })
  @IsNotEmpty({ message: 'Đối tượng đích không được để trống' })
  toObjectId: string;

  @IsEnum(RelationType, { message: 'Loại quan hệ phải là RELATES_TO, DEPENDS_ON, REFERENCES hoặc PARENT_OF' })
  relationType: RelationType;
}

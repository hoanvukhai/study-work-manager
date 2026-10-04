import { IsIn } from 'class-validator';

export class LifecycleActionDto {
  @IsIn(['ARCHIVE', 'TRASH', 'RESTORE'], {
    message: 'Hành động phải là ARCHIVE, TRASH hoặc RESTORE',
  })
  action: 'ARCHIVE' | 'TRASH' | 'RESTORE';
}

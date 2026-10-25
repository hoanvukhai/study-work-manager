import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @Length(64, 64, { message: 'Liên kết đặt lại mật khẩu không hợp lệ' })
  @Matches(/^[0-9a-f]+$/, { message: 'Liên kết đặt lại mật khẩu không hợp lệ' })
  token: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải có tối thiểu 8 ký tự' })
  newPassword: string;
}

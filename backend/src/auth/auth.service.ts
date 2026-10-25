import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from '../mail/mail.service';
import { createHash, randomBytes } from 'crypto';

/** Sai mật khẩu quá số lần này thì khoá đăng nhập tạm thời (FR-AUTH-10). */
export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 15;
/** Liên kết đặt lại mật khẩu hết hạn sau ngần này phút. */
export const RESET_TOKEN_MINUTES = 30;
export const FORGOT_PASSWORD_MESSAGE = 'Nếu email này đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.';
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Một thông báo duy nhất cho mọi lý do đăng nhập thất bại → không lộ tài khoản nào tồn tại / đang bị khoá tạm. */
export const LOGIN_FAILED_MESSAGE =
  'Email hoặc mật khẩu không chính xác, hoặc tài khoản đang tạm khoá do nhập sai nhiều lần (thử lại sau 15 phút).';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Email này đã được đăng ký trong hệ thống');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName.trim(),
        avatarUrl: dto.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.fullName)}`,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const accessToken = this.generateToken(user.id, user.email);

    return {
      message: 'Đăng ký tài khoản thành công',
      user,
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);
    }

    // Đang trong thời gian khoá tạm: từ chối kể cả khi mật khẩu đúng (không cho dò tiếp)
    if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
      throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      const failed = user.failedLoginCount + 1;
      const lock = failed >= MAX_FAILED_LOGINS;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: lock ? 0 : failed,
          lockoutUntil: lock ? new Date(Date.now() + LOCKOUT_MINUTES * 60000) : null,
        },
      });
      throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);
    }

    // Chỉ báo khoá (do Admin) sau khi đã xác thực đúng mật khẩu (tránh lộ trạng thái tài khoản)
    if (user.lockedAt) {
      throw new UnauthorizedException('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // Cập nhật thời điểm đăng nhập gần nhất
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), failedLoginCount: 0, lockoutUntil: null },
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };

    const accessToken = this.generateToken(safeUser.id, safeUser.email);

    return {
      message: 'Đăng nhập thành công',
      user: safeUser,
      accessToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            spaces: true,
            objects: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.getProfile(userId);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName.trim() }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl.trim() }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  /**
   * Quên mật khẩu: luôn trả cùng một thông báo dù email có tồn tại hay không (không lộ tài khoản).
   * Mỗi lần yêu cầu mới sẽ vô hiệu hoá các liên kết cũ chưa dùng.
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (user && !user.lockedAt) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.$transaction([
        this.prisma.passwordReset.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } }),
        this.prisma.passwordReset.create({
          data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TOKEN_MINUTES * 60000) },
        }),
      ]);
      const base = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
      await this.mail.send({
        to: user.email,
        subject: 'Đặt lại mật khẩu Study & Work',
        text:
          `Xin chào ${user.fullName},\n\n` +
          `Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu. Mở liên kết sau trong ${RESET_TOKEN_MINUTES} phút:\n` +
          `${base}/reset-password?token=${token}\n\n` +
          `Nếu không phải bạn yêu cầu, hãy bỏ qua thư này — mật khẩu của bạn không bị thay đổi.`,
      });
    }
    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  /** Đặt mật khẩu mới bằng token: dùng được một lần, còn hạn; thành công thì huỷ mọi liên kết còn lại. */
  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    const passwordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        // Đặt lại cả bộ đếm đăng nhập sai và khoá tạm: người dùng vừa chứng minh sở hữu email
        data: { passwordHash, failedLoginCount: 0, lockoutUntil: null },
      }),
      this.prisma.passwordReset.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: new Date() } }),
    ]);
    return { message: 'Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.' };
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }
}

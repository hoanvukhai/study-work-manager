import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Đã có lỗi xảy ra phía máy chủ';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message
          ? Array.isArray(resObj.message)
            ? resObj.message[0]
            : resObj.message
          : exception.message;

        if (Array.isArray(resObj.message)) {
          errors = resObj.message;
        } else if (resObj.error) {
          errors = [resObj.error];
        }
      }
    } else if (exception instanceof Error) {
      const code = (exception as { code?: string }).code;
      if (code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Dữ liệu bị trùng với bản ghi đã có';
      } else if (code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Không tìm thấy dữ liệu yêu cầu';
      }
      // Lỗi nội bộ khác: giữ thông báo chung, không trả chi tiết CSDL ra ngoài
    }

    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      statusCode: status,
      message,
      errors: errors.length > 0 ? errors : [message],
      timestamp: new Date().toISOString(),
    });
  }
}

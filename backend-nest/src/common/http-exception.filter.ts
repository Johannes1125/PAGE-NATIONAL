import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent: any = exception.getResponse();

      if (typeof resContent === 'object' && resContent !== null) {
        // Handle validation errors (typically BadRequestException status 400 with array messages)
        if (status === HttpStatus.BAD_REQUEST && Array.isArray(resContent.message)) {
          status = HttpStatus.UNPROCESSABLE_ENTITY; // Laravel 422 Unprocessable Entity
          message = 'Validation error';
          
          errors = {};
          resContent.message.forEach((msg: string) => {
            // Guess field name from the validation message (e.g. "email must be an email")
            const words = msg.split(' ');
            const field = words[0] || 'field';
            const cleanField = field.replace(/['"`]/g, '');
            if (!errors[cleanField]) {
              errors[cleanField] = [];
            }
            errors[cleanField].push(msg);
          });
        } else if (resContent.errors) {
          // If the exception already has an errors object (manually thrown validation error)
          status = exception.getStatus();
          message = resContent.message || 'Validation error';
          errors = resContent.errors;
        } else {
          message = resContent.message || resContent.error || message;
        }
      } else if (typeof resContent === 'string') {
        message = resContent;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    });
  }
}

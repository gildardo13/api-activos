import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  Catch,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
@Catch()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          const response = error.getResponse();
          const status = error.getStatus();

          const errorResponse = {
            statusCode: status,
            message: response['message'] || response,
            error: error.name || 'HttpException',
            timestamp: new Date().toISOString(),
            path: context.switchToHttp().getRequest().url,
          };

          return throwError(() => new HttpException(errorResponse, status));
        }

        // Manejar otros errores no HttpException
        const genericErrorResponse = {
          statusCode: 500,
          message: error.message || 'An unexpected error occurred',
          error: error.name || 'InternalServerError',
          stack: error.stack, // Añadimos el stack para depuración
          timestamp: new Date().toISOString(),
          path: context.switchToHttp().getRequest().url,
        };

        return throwError(() => new HttpException(genericErrorResponse, 500));
      }),
    );
  }
}

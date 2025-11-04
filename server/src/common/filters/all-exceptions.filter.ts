import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import type { Request, Response } from 'express';
  
  type HttpErrorBody =
    | string
    | {
        message?: string | string[];
        error?: string;
        statusCode?: number;
        errors?: unknown;
        [key: string]: unknown;
      };
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const res = ctx.getResponse<Response>();
      const req = ctx.getRequest<Request>();
  
      const isHttp = exception instanceof HttpException;
      const status = isHttp
        ? (exception as HttpException).getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const raw: HttpErrorBody = isHttp
        ? ((exception as HttpException).getResponse() as HttpErrorBody)
        : 'Internal Server Error';
  
      const message =
        typeof raw === 'string'
          ? raw
          : Array.isArray(raw?.message)
          ? raw.message.join(', ')
          : (raw?.message as string) ?? (raw?.error as string) ?? 'Error';
  
      const details =
        typeof raw === 'object' && raw
          ? (raw as Record<string, unknown>).errors ?? undefined
          : undefined;
  
      const code =
        typeof (exception as any)?.code === 'string'
          ? (exception as any).code
          : isHttp
          ? 'HTTP_ERROR'
          : 'UNHANDLED_ERROR';
  
      const requestId =
        (req.headers['x-request-id'] as string) ||
        (req.headers['x-correlation-id'] as string) ||
        undefined;
  
      const meta = {
        method: req.method,
        url: req.originalUrl || req.url,
        status,
        requestId,
      };
  
      const stack = (exception as any)?.stack as string | undefined;
      const context = JSON.stringify(meta);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.error(message, stack, context);
      } else {
        this.logger.error(message, undefined, context);
      }
  
      const body = {
        code,
        message,
        details,
        path: req.originalUrl || req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        requestId,
        ...(process.env.NODE_ENV !== 'production' && stack && { stack }),
      };
  
      res.status(status).type('application/json; charset=utf-8').json(body);
    }
  }
  
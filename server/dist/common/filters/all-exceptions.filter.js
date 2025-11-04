"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        const isHttp = exception instanceof common_1.HttpException;
        const status = isHttp
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const raw = isHttp
            ? exception.getResponse()
            : 'Internal Server Error';
        const message = typeof raw === 'string'
            ? raw
            : Array.isArray(raw?.message)
                ? raw.message.join(', ')
                : raw?.message ?? raw?.error ?? 'Error';
        const details = typeof raw === 'object' && raw
            ? raw.errors ?? undefined
            : undefined;
        const code = typeof exception?.code === 'string'
            ? exception.code
            : isHttp
                ? 'HTTP_ERROR'
                : 'UNHANDLED_ERROR';
        const requestId = req.headers['x-request-id'] ||
            req.headers['x-correlation-id'] ||
            undefined;
        const meta = {
            method: req.method,
            url: req.originalUrl || req.url,
            status,
            requestId,
        };
        const stack = exception?.stack;
        const context = JSON.stringify(meta);
        if (process.env.NODE_ENV !== 'production') {
            this.logger.error(message, stack, context);
        }
        else {
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
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map
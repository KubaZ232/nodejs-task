"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const create_image_dto_1 = require("./dto/create-image.dto");
const query_images_dto_1 = require("./dto/query-images.dto");
const images_service_1 = require("./images.service");
const IMAGE_MIME = /^image\/(jpeg|png|webp)$/i;
const uploadOptions = {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        cb(null, IMAGE_MIME.test(file.mimetype));
    },
};
let ImagesController = class ImagesController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(dto, file) {
        const img = await this.service.create(dto, file);
        return {
            id: img.id,
            url: img.url,
            title: img.title,
            width: img.width,
            height: img.height,
        };
    }
    async list(q, req) {
        const limit = q.limit ?? 20;
        const offset = q.offset ?? 0;
        const data = await this.service.list({
            title: q.title,
            limit,
            offset,
            sort: q.sort,
            fields: q.fields,
        });
        const base = `${req.protocol}://${req.get('host')}${req.path}`;
        const mk = (o) => {
            const params = new URLSearchParams({
                ...req.query,
                limit: String(limit),
                offset: String(o),
            });
            return `${base}?${params.toString()}`;
        };
        const next = offset + limit < data.total ? mk(offset + limit) : null;
        const prev = offset - limit >= 0 ? mk(offset - limit) : null;
        return { ...data, links: { self: mk(offset), next, prev } };
    }
    async get(id) {
        const img = await this.service.getById(id);
        return {
            id: img.id,
            url: img.url,
            title: img.title,
            width: img.width,
            height: img.height,
        };
    }
};
exports.ImagesController = ImagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', uploadOptions)),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['title', 'width', 'height', 'file'],
            properties: {
                title: { type: 'string' },
                width: { type: 'integer', example: 800, minimum: 1, maximum: 10000 },
                height: { type: 'integer', example: 600, minimum: 1, maximum: 10000 },
                file: { type: 'string', format: 'binary' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        fileIsRequired: true,
        validators: [new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_image_dto_1.CreateImageDto, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10, minimum: 0 }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number, example: 0, minimum: 0 }),
    (0, swagger_1.ApiQuery)({ name: 'title', required: false, type: String, description: 'contains text' }),
    (0, swagger_1.ApiQuery)({ name: 'sort', required: false, type: String, example: 'createdAt:desc' }),
    (0, swagger_1.ApiQuery)({ name: 'fields', required: false, type: String, example: 'id,title,url' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_images_dto_1.QueryImagesDto, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "get", null);
exports.ImagesController = ImagesController = __decorate([
    (0, swagger_1.ApiTags)('images'),
    (0, common_1.Controller)('images'),
    __metadata("design:paramtypes", [images_service_1.ImagesService])
], ImagesController);
//# sourceMappingURL=images.controller.js.map
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const sharp_1 = __importDefault(require("sharp"));
const image_entity_1 = require("./image.entity");
const local_storage_1 = require("./storage/local.storage");
let ImagesService = class ImagesService {
    repo;
    store;
    constructor(repo) {
        this.repo = repo;
        this.store = new local_storage_1.LocalStorage();
    }
    async create(dto, file) {
        if (!file || !/^image\/(png|jpe?g|webp|gif|bmp)$/i.test(file.mimetype)) {
            throw new common_1.BadRequestException('Unsupported or missing image');
        }
        const resized = await (0, sharp_1.default)(file.buffer)
            .resize(dto.width, dto.height, { fit: 'cover' })
            .toFormat('webp', { quality: 82 })
            .toBuffer();
        const key = `${new Date().toISOString().slice(0, 10)}/${(0, crypto_1.randomUUID)()}.webp`;
        const saved = await this.store.save(resized, key, 'image/webp');
        const entity = this.repo.create({
            title: dto.title,
            width: dto.width,
            height: dto.height,
            url: saved.publicUrl,
        });
        return await this.repo.save(entity);
    }
    async list(q) {
        const where = q.title ? { title: (0, typeorm_2.ILike)(`%${q.title}%`) } : {};
        const [items, total] = await this.repo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            take: q.limit,
            skip: q.offset,
            select: ['id', 'title', 'url', 'width', 'height', 'createdAt'],
        });
        return { total, limit: q.limit, offset: q.offset, items };
    }
    async getById(id) {
        const img = await this.repo.findOne({ where: { id } });
        if (!img)
            throw new common_1.NotFoundException('Image not found');
        return img;
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ImagesService);
//# sourceMappingURL=images.service.js.map
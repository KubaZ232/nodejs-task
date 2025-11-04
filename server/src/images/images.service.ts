import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { Image } from './image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { StorageDriver } from './storage/storage.interface';
import { LocalStorage } from './storage/local.storage';

@Injectable()
export class ImagesService {
  private store: StorageDriver;

  constructor(@InjectRepository(Image) private repo: Repository<Image>) {
    this.store = new LocalStorage();
  }

  async create(dto: CreateImageDto, file: Express.Multer.File) {
    if (!file || !/^image\/(png|jpe?g|webp|gif|bmp)$/i.test(file.mimetype)) {
      throw new BadRequestException('Unsupported or missing image');
    }

    const resized = await sharp(file.buffer)
      .resize(dto.width, dto.height, { fit: 'cover' })
      .toFormat('webp', { quality: 82 })
      .toBuffer();

    const key = `${new Date().toISOString().slice(0,10)}/${randomUUID()}.webp`;
    const saved = await this.store.save(resized, key, 'image/webp');

    const entity = this.repo.create({
      title: dto.title,
      width: dto.width,
      height: dto.height,
      url: saved.publicUrl,
    });
    return await this.repo.save(entity);
  }

  async list(q: { title?: string; limit: number; offset: number }) {
    const where = q.title ? { title: ILike(`%${q.title}%`) } : {};
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: q.limit,
      skip: q.offset,
      select: ['id','title','url','width','height','createdAt'],
    });
    return { total, limit: q.limit, offset: q.offset, items };
  }

  async getById(id: string) {
    const img = await this.repo.findOne({ where: { id } });
    if (!img) throw new NotFoundException('Image not found');
    return img;
  }
}

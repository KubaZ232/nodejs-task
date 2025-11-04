import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { CreateImageDto } from './dto/create-image.dto';
import { QueryImagesDto } from './dto/query-images.dto';
import { ImagesService } from './images.service';

const IMAGE_MIME = /^image\/(jpeg|png|webp)$/i;

const uploadOptions: MulterOptions = {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, IMAGE_MIME.test(file.mimetype));
  },
};

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly service: ImagesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiBody({
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
  })
  async create(
    @Body() dto: CreateImageDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const img = await this.service.create(dto, file);
    return {
      id: img.id,
      url: img.url,
      title: img.title,
      width: img.width,
      height: img.height,
    };
  }

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, minimum: 0 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0, minimum: 0 })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'contains text' })
  @ApiQuery({ name: 'sort', required: false, type: String, example: 'createdAt:desc' })
  @ApiQuery({ name: 'fields', required: false, type: String, example: 'id,title,url' })
  async list(@Query() q: QueryImagesDto, @Req() req: Request) {
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
    const mk = (o: number) => {
      const params = new URLSearchParams({
        ...(req.query as any),
        limit: String(limit),
        offset: String(o),
      });
      return `${base}?${params.toString()}`;
    };

    const next = offset + limit < data.total ? mk(offset + limit) : null;
    const prev = offset - limit >= 0 ? mk(offset - limit) : null;

    return { ...data, links: { self: mk(offset), next, prev } };
  }

  @Get(':id')
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    const img = await this.service.getById(id);
    return {
      id: img.id,
      url: img.url,
      title: img.title,
      width: img.width,
      height: img.height,
    };
  }
}

import { CreateImageDto } from './dto/create-image.dto';
import { QueryImagesDto } from './dto/query-images.dto';
import { ImagesService } from './images.service';
export declare class ImagesController {
    private readonly service;
    constructor(service: ImagesService);
    create(dto: CreateImageDto, file: Express.Multer.File): Promise<{
        id: string;
        url: string;
        title: string;
        width: number;
        height: number;
    }>;
    list(q: QueryImagesDto): Promise<{
        total: number;
        limit: number;
        offset: number;
        items: import("./image.entity").Image[];
    }>;
    get(id: string): Promise<{
        id: string;
        url: string;
        title: string;
        width: number;
        height: number;
    }>;
}

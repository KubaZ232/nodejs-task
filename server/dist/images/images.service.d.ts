import { Repository } from 'typeorm';
import { Image } from './image.entity';
import { CreateImageDto } from './dto/create-image.dto';
export declare class ImagesService {
    private repo;
    private store;
    constructor(repo: Repository<Image>);
    create(dto: CreateImageDto, file: Express.Multer.File): Promise<Image>;
    list(q: {
        title?: string;
        limit: number;
        offset: number;
        sort?: string;
        fields?: string;
    }): Promise<{
        total: number;
        limit: number;
        offset: number;
        items: Image[];
    }>;
    getById(id: string): Promise<Image>;
}

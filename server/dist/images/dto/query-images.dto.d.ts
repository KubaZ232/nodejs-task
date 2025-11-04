import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QueryImagesDto extends PaginationDto {
    title?: string;
    sort?: string;
    fields?: string;
}

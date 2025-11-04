import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryImagesDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'title contains (case-insensitive)' })
  @IsOptional() @IsString()
  title?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryImagesDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'title contains (case-insensitive)' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'createdAt:desc', description: 'field:asc|desc' })
  @IsOptional() @IsString()
  @Matches(/^[a-zA-Z_]+:(asc|desc)$/i, { message: 'sort must be "field:asc|desc"' })
  sort?: string;

  @ApiPropertyOptional({ example: 'id,title,url', description: 'comma-separated list of fields to return' })
  @IsOptional() @IsString()
  fields?: string;
}

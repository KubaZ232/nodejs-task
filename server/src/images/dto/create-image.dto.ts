
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ type: Number, example: 800 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  width!: number;

  @ApiProperty({ type: Number, example: 600 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  height!: number;
}

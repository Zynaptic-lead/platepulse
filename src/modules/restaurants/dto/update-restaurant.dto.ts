import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuItemDto } from './create-menu-item.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
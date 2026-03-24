import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min, MaxLength } from 'class-validator';
import { MenuItemCategory } from '../entities/menu-item.entity';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Margherita Pizza', description: 'Name of the menu item' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Fresh mozzarella, tomato sauce, basil', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 12.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: MenuItemCategory, example: MenuItemCategory.MAIN_COURSE })
  @IsEnum(MenuItemCategory)
  category: MenuItemCategory;

  @ApiProperty({ example: 'https://example.com/pizza.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isVegetarian?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isGlutenFree?: boolean;
}
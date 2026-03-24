import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { RestaurantStatus } from '../entities/restaurant.entity';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Pizza Heaven' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: ['Italian', 'Pizza'] })
  @IsOptional()
  @IsArray()
  cuisineTypes?: string[];

  @ApiProperty({ example: 5.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @ApiProperty({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiProperty({ example: 45 })
  @IsOptional()
  @IsNumber()
  estimatedDeliveryTime?: number;
}
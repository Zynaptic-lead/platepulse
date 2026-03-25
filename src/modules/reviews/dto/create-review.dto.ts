import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsUUID, Min, Max, IsOptional } from 'class-validator';
import { ReviewType } from '../entities/review.entity';

export class CreateReviewDto {
  @ApiProperty({ enum: ReviewType, example: ReviewType.RESTAURANT })
  @IsEnum(ReviewType)
  type: ReviewType;

  @ApiProperty({ example: 'restaurant-uuid', required: false })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiProperty({ example: 'driver-uuid', required: false })
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @ApiProperty({ example: 'order-uuid' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great food and fast delivery!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
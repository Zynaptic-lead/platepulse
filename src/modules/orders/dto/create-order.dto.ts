import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsArray, IsNumber, Min, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

class OrderItemDto {
  @ApiProperty({ example: 'menu-item-uuid' })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'restaurant-uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '123 Main St, New York, NY 10001' })
  @IsString()
  deliveryAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}
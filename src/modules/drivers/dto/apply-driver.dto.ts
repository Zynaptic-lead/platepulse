import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { VehicleType } from '../entities/driver.entity';

export class ApplyDriverDto {
  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.CAR })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiProperty({ example: 'Toyota Camry' })
  @IsString()
  vehicleModel: string;

  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  licensePlate: string;

  @ApiProperty({ required: false, example: 'Black' })
  @IsOptional()
  @IsString()
  vehicleColor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  licensePhoto?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  insurancePhoto?: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { StreamStatus } from '../entities/stream.entity';

export class UpdateStreamDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(StreamStatus)
  status?: StreamStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  settings?: any;
}
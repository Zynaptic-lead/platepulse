import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class CreateStreamDto {
  @ApiProperty({ example: 'Kitchen Camera 1' })
  @IsString()
  roomName: string;

  @ApiProperty({ required: false, example: { quality: '720p' } })
  @IsOptional()
  settings?: any;
}
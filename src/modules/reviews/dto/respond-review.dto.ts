import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RespondReviewDto {
  @ApiProperty({ example: 'Thank you for your feedback!' })
  @IsString()
  response: string;
}
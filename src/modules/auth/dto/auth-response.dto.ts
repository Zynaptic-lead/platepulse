import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Registration successful' })
  message: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
  };

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken?: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  refreshToken?: string;

  @ApiProperty({ example: '7d' })
  expiresIn?: string;
}
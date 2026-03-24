import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registering new user: ${registerDto.email}`);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException({
        message: 'User with this email already exists',
        statusCode: 409,
      });
    }

    // Create new user
    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
      phone: registerDto.phone,
      role: registerDto.role,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Return response
    return {
      success: true,
      message: 'Registration successful',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt: ${loginDto.email}`);

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        statusCode: 401,
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException({
        message: 'Account is deactivated. Please contact support.',
        statusCode: 401,
      });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        statusCode: 401,
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: 'Login successful',
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Refreshing token');

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      return {
        success: true,
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    this.logger.log(`Logging out user: ${userId}`);

    // Clear refresh token
    await this.userRepository.update(userId, {
      refreshToken: null as any,
    });

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        statusCode: 404,
      });
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Get expiration times
    const accessTokenExpires = this.configService.get<string>('jwt.accessTokenExpires') || '7d';
    const refreshTokenExpires = this.configService.get<string>('jwt.refreshTokenExpires') || '30d';

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpires as any,
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpires as any,
    });

    // Store refresh token in database
    await this.userRepository.update(user.id, {
      refreshToken: refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpires,
    };
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, ...sanitized } = user;
    return sanitized;
  }
}
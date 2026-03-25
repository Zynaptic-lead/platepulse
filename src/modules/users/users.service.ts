import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      select: ['id', 'name', 'email', 'phone', 'role', 'avatar', 'isActive', 'createdAt'],
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'role', 'avatar', 'isActive', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(userId: string, updateDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    Object.assign(user, updateDto);
    await this.userRepository.save(user);

    const { password, refreshToken, resetPasswordToken, resetPasswordExpires, ...result } = user;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.validatePassword(changePasswordDto.currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);

    return { success: true, message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return { success: true, message: 'If your email is registered, you will receive a reset link' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await this.userRepository.save(user);

    // TODO: Send email with reset link
    // For now, return the token (in production, send via email)
    return {
      success: true,
      message: 'Password reset email sent',
      resetToken, // Remove in production, only for testing
    };
  }

  async resetPassword(token: string, newPassword: string) {
  const user = await this.userRepository.findOne({
    where: {
      resetPasswordToken: token,
    },
  });

  if (!user) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  // Check if token is expired
  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    throw new BadRequestException('Reset token has expired');
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = null as any;
  user.resetPasswordExpires = null as any;
  await this.userRepository.save(user);

  return { success: true, message: 'Password reset successfully' };
}

  async deleteAccount(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete the user
    await this.userRepository.softDelete(userId);

    return { success: true, message: 'Account deleted successfully' };
  }
}
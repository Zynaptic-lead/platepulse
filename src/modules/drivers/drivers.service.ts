import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver, DriverStatus } from './entities/driver.entity';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { ApplyDriverDto } from './dto/apply-driver.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async apply(userId: string, applyDto: ApplyDriverDto) {
    // Check if user already applied
    const existingDriver = await this.driverRepository.findOne({
      where: { userId },
    });

    if (existingDriver) {
      throw new BadRequestException('You have already applied to be a driver');
    }

    // Update user role to driver
    await this.userRepository.update(userId, { 
      role: UserRole.DRIVER 
    });

    // Create driver application
    const driver = this.driverRepository.create({
      userId,
      ...applyDto,
      status: DriverStatus.PENDING,
    });

    return await this.driverRepository.save(driver);
  }

  async findAll(status?: DriverStatus) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return await this.driverRepository.find({
      where,
      relations: ['user'],
    });
  }

  async findOne(id: string) {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async findByUser(userId: string) {
    const driver = await this.driverRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    return driver;
  }

  async updateStatus(id: string, status: DriverStatus) {
    const driver = await this.findOne(id);
    driver.status = status;
    return await this.driverRepository.save(driver);
  }

  async updateLocation(id: string, locationDto: UpdateLocationDto) {
    const driver = await this.findOne(id);
    driver.currentLatitude = locationDto.latitude;
    driver.currentLongitude = locationDto.longitude;
    driver.lastLocationUpdate = new Date();
    return await this.driverRepository.save(driver);
  }

  async updateAvailability(id: string, isAvailable: boolean) {
    const driver = await this.findOne(id);
    driver.isAvailable = isAvailable;
    return await this.driverRepository.save(driver);
  }

  async getAvailableDrivers() {
    return await this.driverRepository.find({
      where: {
        status: DriverStatus.ACTIVE,
        isAvailable: true,
      },
      relations: ['user'],
    });
  }

  async updateEarnings(id: string, amount: number) {
    const driver = await this.findOne(id);
    driver.totalEarnings += amount;
    driver.currentWeekEarnings += amount;
    driver.totalDeliveries += 1;
    return await this.driverRepository.save(driver);
  }
}
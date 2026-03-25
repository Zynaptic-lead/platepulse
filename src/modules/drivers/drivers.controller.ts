import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { ApplyDriverDto } from './dto/apply-driver.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply to become a driver' })
  async apply(@Request() req, @Body() applyDto: ApplyDriverDto) {
    return this.driversService.apply(req.user.id, applyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all drivers (admin only)' })
  async findAll(@Query('status') status?: string) {
    return this.driversService.findAll(status as any);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drivers' })
  async getAvailable() {
    return this.driversService.getAvailableDrivers();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my driver profile' })
  async getMyProfile(@Request() req) {
    return this.driversService.findByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get driver by ID' })
  async findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update driver status (admin only)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.driversService.updateStatus(id, status as any);
  }

  @Put('location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update driver location' })
  async updateLocation(@Request() req, @Body() locationDto: UpdateLocationDto) {
    const driver = await this.driversService.findByUser(req.user.id);
    return this.driversService.updateLocation(driver.id, locationDto);
  }

  @Put('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update driver availability' })
  async updateAvailability(@Request() req, @Body() availabilityDto: UpdateAvailabilityDto) {
    const driver = await this.driversService.findByUser(req.user.id);
    return this.driversService.updateAvailability(driver.id, availabilityDto.isAvailable);
  }
}
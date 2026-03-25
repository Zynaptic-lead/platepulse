import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { StreamsService } from './streams.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Live Streams')
@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Post('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a live stream for restaurant' })
  async create(
    @Request() req,
    @Param('restaurantId') restaurantId: string,
    @Body() createDto: CreateStreamDto,
  ) {
    return this.streamsService.create(req.user.id, restaurantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active streams' })
  async findAll() {
    return this.streamsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active streams for viewing' })
  async getActiveStreams() {
    return this.streamsService.getActiveStreams();
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get stream by restaurant' })
  async findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.streamsService.findByRestaurant(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stream by ID' })
  async findOne(@Param('id') id: string) {
    return this.streamsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update stream status' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateStreamDto,
  ) {
    return this.streamsService.update(req.user.id, id, updateDto);
  }

  @Post(':id/viewers/increment')
  @ApiOperation({ summary: 'Increment viewer count' })
  async incrementViewers(@Param('id') id: string) {
    return this.streamsService.incrementViewers(id);
  }

  @Post(':id/viewers/decrement')
  @ApiOperation({ summary: 'Decrement viewer count' })
  async decrementViewers(@Param('id') id: string) {
    return this.streamsService.decrementViewers(id);
  }
}
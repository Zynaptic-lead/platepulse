import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new restaurant' })
  async create(@Request() req, @Body() createDto: CreateRestaurantDto) {
    return this.restaurantsService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  async findAll() {
    return this.restaurantsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search restaurants' })
  async search(@Query('q') query: string, @Query('city') city?: string) {
    return this.restaurantsService.search(query, city);
  }

  @Get('owner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get owner\'s restaurants' })
  async findByOwner(@Request() req) {
    return this.restaurantsService.findByOwner(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update restaurant' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete restaurant' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.restaurantsService.remove(id, req.user.id);
  }
}
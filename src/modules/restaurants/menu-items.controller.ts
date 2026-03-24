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
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Menu Items')
@Controller('restaurants/:restaurantId/menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add menu item to restaurant' })
  @ApiResponse({ status: 201, description: 'Menu item created' })
  async create(
    @Param('restaurantId') restaurantId: string,
    @Request() req,
    @Body() createDto: CreateMenuItemDto,
  ) {
    return this.menuItemsService.create(restaurantId, req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items for a restaurant' })
  @ApiResponse({ status: 200, description: 'List of menu items' })
  async findAll(@Param('restaurantId') restaurantId: string) {
    return this.menuItemsService.findAllByRestaurant(restaurantId);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get menu items by category' })
  async findByCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('category') category: string,
  ) {
    return this.menuItemsService.findByCategory(restaurantId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  async findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update menu item' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, req.user.id, updateDto);
  }

  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle menu item availability' })
  async toggleAvailability(@Param('id') id: string, @Request() req) {
    return this.menuItemsService.toggleAvailability(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete menu item' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.menuItemsService.remove(id, req.user.id);
  }
}
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@Request() req, @Body() createDto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for current user' })
  async findAll(@Request() req, @Query('status') status?: string) {
    return this.ordersService.findAll(req.user.id, req.user.role, { status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, req.user.id, req.user.role, updateDto);
  }

  @Put(':id/assign-driver')
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Assign driver to order' })
  async assignDriver(@Param('id') id: string, @Request() req) {
    return this.ordersService.assignDriver(id, req.user.id);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get orders by restaurant' })
  async getByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getOrdersByRestaurant(restaurantId);
  }

  @Get('customer/me')
  @ApiOperation({ summary: 'Get current customer orders' })
  async getMyOrders(@Request() req) {
    return this.ordersService.getCustomerOrders(req.user.id);
  }
}
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menu-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(customerId: string, createDto: CreateOrderDto) {
    // Get restaurant
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: createDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Get menu items and calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of createDto.items) {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: item.menuItemId },
      });

      if (!menuItem) {
        throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      }

      if (!menuItem.isAvailable) {
        throw new BadRequestException(`${menuItem.name} is not available`);
      }

      const total = Number(menuItem.price) * item.quantity;
      subtotal += total;

      orderItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: Number(menuItem.price),
        quantity: item.quantity,
        total: total,
        specialInstructions: item.specialInstructions || undefined,
      });
    }

    // Check minimum order amount
    if (subtotal < Number(restaurant.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount is ${restaurant.minOrderAmount}`,
      );
    }

    // Calculate total with delivery fee
    const total = subtotal + Number(restaurant.deliveryFee);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const orderData = {
      orderNumber,
      customerId,
      restaurantId: restaurant.id,
      subtotal,
      deliveryFee: Number(restaurant.deliveryFee),
      total,
      paymentMethod: createDto.paymentMethod,
      deliveryAddress: createDto.deliveryAddress,
      customerNotes: createDto.customerNotes || undefined,
      estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
    };

    const order = this.orderRepository.create(orderData);
    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    for (const item of orderItems) {
      const orderItemData = {
        ...item,
        orderId: savedOrder.id,
      };
      const orderItem = this.orderItemRepository.create(orderItemData);
      await this.orderItemRepository.save(orderItem);
    }

    // Return order with items
    return this.findOne(savedOrder.id);
  }

  async findAll(userId: string, role: string, filters?: any) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.restaurant', 'restaurant')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.driver', 'driver');

    if (role === 'customer') {
      query.where('order.customerId = :userId', { userId });
    } else if (role === 'restaurant_owner') {
      query.where('restaurant.ownerId = :userId', { userId });
    } else if (role === 'driver') {
      query.where('order.driverId = :userId', { userId });
    }

    if (filters?.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    return query.orderBy('order.createdAt', 'DESC').getMany();
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'restaurant', 'customer', 'driver'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, userId: string, role: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    // Check permissions
    if (role === 'customer' && order.customerId !== userId) {
      throw new ForbiddenException('You can only update your own orders');
    }

    if (role === 'restaurant_owner') {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: order.restaurantId, ownerId: userId },
      });
      if (!restaurant) {
        throw new ForbiddenException('You can only update orders for your restaurants');
      }
    }

    // Update status and timestamps
    order.status = updateDto.status;

    switch (updateDto.status) {
      case OrderStatus.CONFIRMED:
        order.confirmedAt = new Date();
        break;
      case OrderStatus.PREPARING:
        order.preparingAt = new Date();
        break;
      case OrderStatus.READY:
        order.readyAt = new Date();
        order.pickupCode = `PICK-${Math.floor(Math.random() * 10000)}`;
        break;
      case OrderStatus.PICKED_UP:
        order.pickedUpAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        order.deliveredAt = new Date();
        order.actualDeliveryTime = new Date();
        order.paymentStatus = PaymentStatus.PAID;
        break;
      case OrderStatus.CANCELLED:
        order.cancelledAt = new Date();
        order.cancelledReason = updateDto.reason || '';
        break;
    }

    return this.orderRepository.save(order);
  }

  async assignDriver(orderId: string, driverId: string) {
    const order = await this.findOne(orderId);

    if (order.status !== OrderStatus.READY) {
      throw new BadRequestException('Order must be ready before assigning driver');
    }

    order.driverId = driverId;
    order.status = OrderStatus.PICKED_UP;

    return this.orderRepository.save(order);
  }

  async getOrdersByRestaurant(restaurantId: string) {
    return this.orderRepository.find({
      where: { restaurantId },
      relations: ['items', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCustomerOrders(customerId: string) {
    return this.orderRepository.find({
      where: { customerId },
      relations: ['restaurant', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDriverOrders(driverId: string) {
    return this.orderRepository.find({
      where: { driverId },
      relations: ['restaurant', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }
}
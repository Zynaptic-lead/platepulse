import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menu-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Restaurant, MenuItem])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
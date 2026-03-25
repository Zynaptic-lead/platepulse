import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaystackService } from './paystack.service';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, User]), // Add User here
    ConfigModule,
  ],
  controllers: [PaymentsController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaymentsModule {}
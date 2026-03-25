import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { Restaurant } from '../../modules/restaurants/entities/restaurant.entity';
import { Driver } from '../../modules/drivers/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Order, Restaurant, Driver])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewType } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
  ) {}

  async create(customerId: string, createDto: CreateReviewDto) {
    // Check if order exists and belongs to customer
    const order = await this.orderRepository.findOne({
      where: { id: createDto.orderId, customerId },
    });

    if (!order) {
      throw new NotFoundException('Order not found or does not belong to you');
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      throw new BadRequestException('You can only review delivered orders');
    }

    // Check if already reviewed
    const existingReview = await this.reviewRepository.findOne({
      where: { orderId: createDto.orderId, type: createDto.type },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this');
    }

    // Validate based on review type
    if (createDto.type === ReviewType.RESTAURANT) {
      if (!createDto.restaurantId) {
        throw new BadRequestException('Restaurant ID is required for restaurant review');
      }
      if (createDto.restaurantId !== order.restaurantId) {
        throw new BadRequestException('Restaurant does not match order');
      }
    } else if (createDto.type === ReviewType.DRIVER) {
      if (!createDto.driverId) {
        throw new BadRequestException('Driver ID is required for driver review');
      }
      if (createDto.driverId !== order.driverId) {
        throw new BadRequestException('Driver does not match order');
      }
    }

    // Create review
    const review = this.reviewRepository.create({
      ...createDto,
      customerId,
      isApproved: true,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update ratings
    await this.updateRatings(createDto.type, createDto.restaurantId, createDto.driverId);

    return savedReview;
  }

  async findAll(type?: ReviewType, restaurantId?: string, driverId?: string) {
    const where: any = { isApproved: true };
    
    if (type) {
      where.type = type;
    }
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    if (driverId) {
      where.driverId = driverId;
    }

    return await this.reviewRepository.find({
      where,
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['customer', 'restaurant', 'driver', 'order'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async respond(id: string, ownerId: string, respondDto: RespondReviewDto) {
    const review = await this.findOne(id);

    // Check permissions
    if (review.type === ReviewType.RESTAURANT) {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: review.restaurantId, ownerId },
      });
      if (!restaurant) {
        throw new ForbiddenException('You can only respond to reviews for your restaurants');
      }
    } else {
      throw new ForbiddenException('Only restaurant reviews can be responded to');
    }

    review.response = respondDto.response;
    review.respondedAt = new Date();

    return await this.reviewRepository.save(review);
  }

  async getRestaurantRatings(restaurantId: string) {
    const reviews = await this.reviewRepository.find({
      where: { restaurantId, type: ReviewType.RESTAURANT, isApproved: true },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      ratingDistribution,
      reviews,
    };
  }

  async getDriverRatings(driverId: string) {
    const driver = await this.driverRepository.findOne({
      where: { userId: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const reviews = await this.reviewRepository.find({
      where: { driverId: driver.id, type: ReviewType.DRIVER, isApproved: true },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Update driver rating
    driver.rating = Number(averageRating.toFixed(1));
    driver.totalRatings = totalReviews;
    await this.driverRepository.save(driver);

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      reviews,
    };
  }

  private async updateRatings(type: ReviewType, restaurantId?: string, driverId?: string) {
    if (type === ReviewType.RESTAURANT && restaurantId) {
      const stats = await this.getRestaurantRatings(restaurantId);
      await this.restaurantRepository.update(restaurantId, {
        rating: stats.averageRating,
        totalReviews: stats.totalReviews,
      });
    } else if (type === ReviewType.DRIVER && driverId) {
      await this.getDriverRatings(driverId);
    }
  }
}
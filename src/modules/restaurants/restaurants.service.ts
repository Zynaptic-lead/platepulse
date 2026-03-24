import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant, RestaurantStatus } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(ownerId: string, createDto: CreateRestaurantDto) {
    const restaurant = this.restaurantRepository.create({
      ...createDto,
      ownerId,
      status: RestaurantStatus.PENDING,
    });
    
    return await this.restaurantRepository.save(restaurant);
  }

  async findAll() {
    return await this.restaurantRepository.find({
      where: { status: RestaurantStatus.ACTIVE },
      relations: ['owner'],
    });
  }

  async findOne(id: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['owner', 'menuItems'],
    });
    
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    
    return restaurant;
  }

  async findByOwner(ownerId: string) {
    return await this.restaurantRepository.find({
      where: { ownerId },
      relations: ['menuItems'],
    });
  }

  async update(id: string, ownerId: string, updateDto: UpdateRestaurantDto) {
    const restaurant = await this.findOne(id);
    
    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own restaurants');
    }
    
    Object.assign(restaurant, updateDto);
    return await this.restaurantRepository.save(restaurant);
  }

  async remove(id: string, ownerId: string) {
    const restaurant = await this.findOne(id);
    
    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own restaurants');
    }
    
    await this.restaurantRepository.softDelete(id);
    return { success: true, message: 'Restaurant deleted successfully' };
  }

  async search(query: string, city?: string) {
    const qb = this.restaurantRepository.createQueryBuilder('restaurant');
    
    qb.where('restaurant.status = :status', { status: RestaurantStatus.ACTIVE });
    
    if (query) {
      qb.andWhere('restaurant.name ILIKE :query OR restaurant.cuisineTypes ILIKE :query', 
        { query: `%${query}%` });
    }
    
    if (city) {
      qb.andWhere('restaurant.city ILIKE :city', { city: `%${city}%` });
    }
    
    return await qb.getMany();
  }
}
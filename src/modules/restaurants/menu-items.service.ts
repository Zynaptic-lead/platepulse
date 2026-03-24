import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem, MenuItemCategory } from './entities/menu-item.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(restaurantId: string, ownerId: string, createDto: CreateMenuItemDto) {
    // Verify restaurant exists and belongs to owner
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId, ownerId },
    });

    if (!restaurant) {
      throw new ForbiddenException('Restaurant not found or you do not own it');
    }

    const menuItem = this.menuItemRepository.create({
      ...createDto,
      restaurantId,
    });

    return await this.menuItemRepository.save(menuItem);
  }

  async findAllByRestaurant(restaurantId: string) {
    return await this.menuItemRepository.find({
      where: { restaurantId },
      order: { category: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string) {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return menuItem;
  }

  async update(id: string, ownerId: string, updateDto: UpdateMenuItemDto) {
    const menuItem = await this.findOne(id);
    
    // Verify ownership through restaurant
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: menuItem.restaurantId, ownerId },
    });

    if (!restaurant) {
      throw new ForbiddenException('You do not own this menu item');
    }

    Object.assign(menuItem, updateDto);
    return await this.menuItemRepository.save(menuItem);
  }

  async remove(id: string, ownerId: string) {
    const menuItem = await this.findOne(id);
    
    // Verify ownership through restaurant
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: menuItem.restaurantId, ownerId },
    });

    if (!restaurant) {
      throw new ForbiddenException('You do not own this menu item');
    }

    await this.menuItemRepository.delete(id);
    return { success: true, message: 'Menu item deleted successfully' };
  }

  async toggleAvailability(id: string, ownerId: string) {
    const menuItem = await this.findOne(id);
    
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: menuItem.restaurantId, ownerId },
    });

    if (!restaurant) {
      throw new ForbiddenException('You do not own this menu item');
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await this.menuItemRepository.save(menuItem);
    
    return { 
      success: true, 
      isAvailable: menuItem.isAvailable,
      message: `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`
    };
  }

  async findByCategory(restaurantId: string, category: string) {
    // Convert string to enum value
    const categoryEnum = category as MenuItemCategory;
    
    return await this.menuItemRepository.find({
      where: { 
        restaurantId, 
        category: categoryEnum 
      },
      order: { price: 'ASC' },
    });
  }
}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, MenuItem])],
  controllers: [RestaurantsController, MenuItemsController],
  providers: [RestaurantsService, MenuItemsService],
  exports: [RestaurantsService, MenuItemsService],
})
export class RestaurantsModule {}
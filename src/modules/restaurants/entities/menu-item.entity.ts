import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

export enum MenuItemCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SIDE = 'side',
  SPECIAL = 'special',
}

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: MenuItemCategory,
    default: MenuItemCategory.MAIN_COURSE,
  })
  category: MenuItemCategory;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isVegetarian: boolean;

  @Column({ default: false })
  isVegan: boolean;

  @Column({ default: false })
  isGlutenFree: boolean;

  @Column({ type: 'simple-array', nullable: true })
  toppings: string[];

  @Column({ type: 'jsonb', nullable: true })
  modifiers: any;

  @ManyToOne(() => Restaurant, restaurant => restaurant.menuItems)
  restaurant: Restaurant;

  @Column()
  restaurantId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
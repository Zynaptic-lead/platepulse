import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';

export enum ReviewType {
  RESTAURANT = 'restaurant',
  DRIVER = 'driver',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReviewType,
  })
  type: ReviewType;

  @ManyToOne(() => User)
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => Restaurant, { nullable: true })
  restaurant: Restaurant;

  @Column({ nullable: true })
  restaurantId: string;

  @ManyToOne(() => User, { nullable: true })
  driver: User;

  @Column({ nullable: true })
  driverId: string;

  @ManyToOne(() => Order)
  order: Order;

  @Column()
  orderId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ nullable: true })
  response: string;

  @Column({ nullable: true })
  respondedAt: Date;

  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
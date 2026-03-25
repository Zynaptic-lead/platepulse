import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from '../../restaurants/entities/menu-item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => MenuItem)
  menuItem: MenuItem;

  @Column()
  menuItemId: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'jsonb', nullable: true })
  modifiers: any;

  @Column({ nullable: true })
  specialInstructions: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
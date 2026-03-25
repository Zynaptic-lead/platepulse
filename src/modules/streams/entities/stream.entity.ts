import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum StreamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  ENDED = 'ended',
}

@Entity('streams')
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;

  @Column()
  restaurantId: string;

  @Column()
  roomName: string;

  @Column({ nullable: true })
  roomUrl: string;

  @Column()
  streamKey: string;

  @Column({
    type: 'enum',
    enum: StreamStatus,
    default: StreamStatus.INACTIVE,
  })
  status: StreamStatus;

  @Column({ default: 0 })
  viewerCount: number;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @Column({ type: 'jsonb', nullable: true })

@Column({ nullable: true })
title: string; // Stream title (e.g., "Today's Special: Pizza Making!")

@Column({ type: 'text', nullable: true })
description: string; // Stream description

@Column({ nullable: true })
thumbnail: string; // Stream thumbnail image

@Column({ type: 'jsonb', nullable: true })
tags: string[]; // Tags like #cooking, #pizza, #specials

@Column({ type: 'jsonb', nullable: true })
streamerInfo: {
  name: string;
  avatar: string;
  role: string;
};
  settings: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
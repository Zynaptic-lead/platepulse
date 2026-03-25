import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { StreamsController } from './streams.controller';
import { StreamsService } from './streams.service';
import { Stream } from './entities/stream.entity';
import { Restaurant } from '../../modules/restaurants/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stream, Restaurant]), ConfigModule],
  controllers: [StreamsController],
  providers: [StreamsService],
  exports: [StreamsService],
})
export class StreamsModule {}
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Stream, StreamStatus } from './entities/stream.entity';
import { Restaurant } from '../../modules/restaurants/entities/restaurant.entity';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';

@Injectable()
export class StreamsService {
  private readonly dailyApiUrl: string;
  private readonly dailyApiKey: string;

  constructor(
    @InjectRepository(Stream)
    private streamRepository: Repository<Stream>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private configService: ConfigService,
  ) {
    this.dailyApiUrl = this.configService.get('DAILY_API_URL') || 'https://api.daily.co/v1';
    this.dailyApiKey = this.configService.get('DAILY_API_KEY') || '';
  }

  async create(ownerId: string, restaurantId: string, createDto: CreateStreamDto) {
    // Verify restaurant ownership
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId, ownerId },
    });

    if (!restaurant) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    // Check if stream already exists
    const existingStream = await this.streamRepository.findOne({
      where: { restaurantId },
    });

    if (existingStream) {
      throw new ForbiddenException('Stream already exists for this restaurant');
    }

    // Create Daily.co room
    let dailyRoom;
    try {
      const response = await axios.post(
        `${this.dailyApiUrl}/rooms`,
        {
          name: `${restaurant.name}-kitchen-${Date.now()}`,
          privacy: 'public',
          properties: {
            enable_screenshare: false,
            enable_chat: true,
            start_video_off: false,
            start_audio_off: true,
            owner_only_broadcast: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      dailyRoom = response.data;
    } catch (error) {
      throw new Error(`Failed to create Daily.co room: ${error.message}`);
    }

    // Create stream record
    const stream = this.streamRepository.create({
      restaurantId,
      roomName: dailyRoom.name,
      roomUrl: dailyRoom.url,
      streamKey: dailyRoom.id,
      status: StreamStatus.INACTIVE,
      settings: createDto.settings,
    });

    const savedStream = await this.streamRepository.save(stream);

    // Update restaurant
    await this.restaurantRepository.update(restaurantId, {
      hasLiveStream: true,
      streamUrl: dailyRoom.url,
    });

    return {
      ...savedStream,
      dailyRoom,
    };
  }

  async findAll() {
    return await this.streamRepository.find({
      relations: ['restaurant'],
      where: { status: StreamStatus.ACTIVE },
    });
  }

  async findOne(id: string) {
    const stream = await this.streamRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }

  async findByRestaurant(restaurantId: string) {
    return await this.streamRepository.findOne({
      where: { restaurantId },
      relations: ['restaurant'],
    });
  }

  async update(ownerId: string, id: string, updateDto: UpdateStreamDto) {
    const stream = await this.findOne(id);
    
    // Verify ownership
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: stream.restaurantId, ownerId },
    });

    if (!restaurant) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    // Update Daily.co room status if needed
    if (updateDto.status === StreamStatus.ACTIVE && stream.status !== StreamStatus.ACTIVE) {
      try {
        await axios.post(
          `${this.dailyApiUrl}/rooms/${stream.roomName}/start`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.dailyApiKey}`,
            },
          }
        );
        stream.startedAt = new Date();
      } catch (error) {
        throw new Error(`Failed to start stream: ${error.message}`);
      }
    } else if (updateDto.status === StreamStatus.ENDED && stream.status === StreamStatus.ACTIVE) {
      try {
        await axios.post(
          `${this.dailyApiUrl}/rooms/${stream.roomName}/stop`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.dailyApiKey}`,
            },
          }
        );
        stream.endedAt = new Date();
      } catch (error) {
        throw new Error(`Failed to stop stream: ${error.message}`);
      }
    }

    Object.assign(stream, updateDto);
    const savedStream = await this.streamRepository.save(stream);

    // Update restaurant
    await this.restaurantRepository.update(stream.restaurantId, {
      hasLiveStream: savedStream.status === StreamStatus.ACTIVE,
    });

    return savedStream;
  }

  async incrementViewers(id: string) {
    const stream = await this.findOne(id);
    stream.viewerCount += 1;
    return await this.streamRepository.save(stream);
  }

  async decrementViewers(id: string) {
    const stream = await this.findOne(id);
    if (stream.viewerCount > 0) {
      stream.viewerCount -= 1;
    }
    return await this.streamRepository.save(stream);
  }

  async getActiveStreams() {
    return await this.streamRepository.find({
      where: { status: StreamStatus.ACTIVE },
      relations: ['restaurant'],
      order: { viewerCount: 'DESC' },
    });
  }
}
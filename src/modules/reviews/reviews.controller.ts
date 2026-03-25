import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(@Request() req, @Body() createDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  async findAll(
    @Query('type') type?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('driverId') driverId?: string,
  ) {
    return this.reviewsService.findAll(type as any, restaurantId, driverId);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get restaurant ratings and reviews' })
  async getRestaurantRatings(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.getRestaurantRatings(restaurantId);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get driver ratings and reviews' })
  async getDriverRatings(@Param('driverId') driverId: string) {
    return this.reviewsService.getDriverRatings(driverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Put(':id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Respond to a review (restaurant owner only)' })
  async respond(
    @Param('id') id: string,
    @Request() req,
    @Body() respondDto: RespondReviewDto,
  ) {
    return this.reviewsService.respond(id, req.user.id, respondDto);
  }
}
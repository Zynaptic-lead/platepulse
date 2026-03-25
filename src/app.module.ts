import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { StreamsModule } from './modules/streams/streams.module';
import { MapsModule } from './modules/maps/maps.module';
import configuration from './config/configuration';
import { User } from './modules/users/entities/user.entity';
import { Restaurant } from './modules/restaurants/entities/restaurant.entity';
import { MenuItem } from './modules/restaurants/entities/menu-item.entity';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';
import { Driver } from './modules/drivers/entities/driver.entity';
import { Review } from './modules/reviews/entities/review.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Stream } from './modules/streams/entities/stream.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('database.url');
        
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not defined in environment variables');
        }

        const isProduction = configService.get('app.env') === 'production';

        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [User, Restaurant, MenuItem, Order, OrderItem, Driver, Review, Payment, Stream],
          synchronize: !isProduction,
          logging: !isProduction,
          ssl: isProduction ? {
            rejectUnauthorized: false,
          } : false,
          extra: {
            max: 20,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
          },
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('throttler.ttl') || 60,
            limit: configService.get<number>('throttler.limit') || 10,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    HealthModule,
    RestaurantsModule,
    OrdersModule,
    DriversModule,
    ReviewsModule,
    PaymentsModule,
    StreamsModule,
    MapsModule,
  ],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import configuration from './config/configuration';
import { User } from './modules/users/entities/user.entity';
import { Restaurant } from './modules/restaurants/entities/restaurant.entity';
import { MenuItem } from './modules/restaurants/entities/menu-item.entity';
import { OrdersModule } from './modules/orders/orders.module';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';

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

        // Fix SSL mode warning and connection issues
        let connectionUrl = databaseUrl;
        if (connectionUrl.includes('sslmode=require')) {
          connectionUrl = connectionUrl.replace('sslmode=require', 'sslmode=verify-full');
        }

        return {
          type: 'postgres',
          url: connectionUrl,
          entities: [User, Restaurant, MenuItem, Order, OrderItem], // Add all entities here
          synchronize: true, // Force create tables
          logging: true, // Enable logging to see what's happening
          ssl: {
            rejectUnauthorized: false, // Important for Neon
          },
          extra: {
            max: 10,
            connectionTimeoutMillis: 10000, // Increase timeout
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
    HealthModule,
    RestaurantsModule,
    OrdersModule,
  ],
})
export class AppModule {}
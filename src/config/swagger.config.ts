import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export function setupSwagger(app: INestApplication, configService: ConfigService) {
  const swaggerEnabled = configService.get<boolean>('swagger.enabled');
  const swaggerPath = configService.get<string>('swagger.path') || 'api/docs';

  if (!swaggerEnabled) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('PlatePulse API')
    .setDescription('PlatePulse Food Delivery Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Restaurants', 'Restaurant management')
    .addTag('Menu Items', 'Menu item management')
    .addTag('Orders', 'Order management')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);
}
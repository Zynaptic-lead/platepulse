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
    .setDescription(`
      🍕 PlatePulse Food Delivery Platform API Documentation
      
      ## Features
      - User authentication with JWT
      - Restaurant management
      - Order processing
      - Real-time tracking
      - Live kitchen streaming
      
      ## Authentication
      Use the \`/api/auth/login\` endpoint to get a JWT token, then include it in the Authorization header:
      \`Authorization: Bearer <your-token>\`
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Restaurants', 'Restaurant operations')
    .addTag('Orders', 'Order management')
    .addTag('Drivers', 'Driver operations')
    .addTag('Live Streaming', 'Kitchen streaming')
    .setContact('PlatePulse Support', 'https://platepulse.com/support', 'support@platepulse.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setExternalDoc('Postman Collection', '/api-json')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'PlatePulse API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #FF6B35; }
      .swagger-ui .info .title { color: #FF6B35; }
    `,
  });
}
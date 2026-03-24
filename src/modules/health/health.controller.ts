import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check API health' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @ApiResponse({ status: 500, description: 'API is unhealthy' })
  async check() {
    try {
      // Check database connection
      const isConnected = this.connection.isConnected;
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: isConnected ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
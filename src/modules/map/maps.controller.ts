import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Maps')
@Controller('maps')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('geocode')
  @ApiOperation({ summary: 'Convert address to coordinates' })
  async geocode(@Query('address') address: string) {
    return this.mapsService.geocodeAddress(address);
  }

  @Get('distance')
  @ApiOperation({ summary: 'Calculate distance between two points' })
  async calculateDistance(
    @Query('originLat') originLat: number,
    @Query('originLng') originLng: number,
    @Query('destLat') destLat: number,
    @Query('destLng') destLng: number,
  ) {
    return this.mapsService.calculateDistance(originLat, originLng, destLat, destLng);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Place autocomplete' })
  async autocomplete(@Query('input') input: string) {
    return this.mapsService.getPlaceAutocomplete(input);
  }
}
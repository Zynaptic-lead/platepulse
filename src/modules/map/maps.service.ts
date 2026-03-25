import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MapsService {
  // Use OpenStreetMap - FREE, no API key required!
  
  async geocodeAddress(address: string) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'PlatePulse-Food-Delivery/1.0',
        },
      });

      if (response.data && response.data[0]) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
          formattedAddress: response.data[0].display_name,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error.message);
      return null;
    }
  }

  async calculateDistance(originLat: number, originLng: number, destLat: number, destLng: number) {
    // Haversine formula - calculate straight-line distance
    const R = 6371; // Earth's radius in km
    const dLat = (destLat - originLat) * Math.PI / 180;
    const dLon = (destLng - originLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(originLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return {
      distance,
      distanceText: `${distance.toFixed(1)} km`,
      duration: (distance / 30) * 60, // Assuming 30 km/h average speed
      durationText: `${Math.round((distance / 30) * 60)} mins`,
    };
  }

  async getPlaceAutocomplete(input: string) {
    // OpenStreetMap doesn't have autocomplete, return empty
    return [];
  }
}
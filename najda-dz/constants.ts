import { EmergencyType } from './types';
import { Flame, Car, HeartPulse, LifeBuoy } from 'lucide-react';

// IMPORTANT: Replace this with your valid Mapbox Access Token
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiaW1lZGF2ZW8xNiIsImEiOiJjbWsxOXBjbjkwM2ttM2ZzZGFiYmV6emJ4In0.lJs-ng425p0thgfbJnP6Qw'; 

export const ALGERIA_PHONE_REGEX = /^(00213|\+213|0)(5|6|7)[0-9]{8}$/;

// Centralized App Logo - Update this URL to change the image across the app
export const APP_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Logo_Protection_civile_alg%C3%A9rienne.png';

export const EMERGENCY_TYPES_METADATA = [
  {
    id: EmergencyType.FIRE,
    icon: Flame,
    color: 'bg-red-500',
    borderColor: 'border-red-500',
    hoverColor: 'hover:bg-red-600',
    textColor: 'text-red-600'
  },
  {
    id: EmergencyType.ACCIDENT,
    icon: Car,
    color: 'bg-orange-500',
    borderColor: 'border-orange-500',
    hoverColor: 'hover:bg-orange-600',
    textColor: 'text-orange-600'
  },
  {
    id: EmergencyType.MEDICAL,
    icon: HeartPulse,
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    hoverColor: 'hover:bg-blue-600',
    textColor: 'text-blue-600'
  },
  {
    id: EmergencyType.RESCUE,
    icon: LifeBuoy,
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
    textColor: 'text-emerald-600'
  }
];

export const MAP_DEFAULT_CENTER = {
  lng: 3.0588, // Algiers
  lat: 36.7528
};
export enum EmergencyType {
  FIRE = 'حريق',
  ACCIDENT = 'حادث مرور',
  MEDICAL = 'إسعاف طبي',
  RESCUE = 'إنقاذ'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ReportData {
  phoneNumber: string;
  emergencyType: EmergencyType | null;
  location: Coordinates | null;
  locationManual: boolean;
  description: string;
  photos: File[];
  audioBlob: Blob | null;
}

export type AppStep = 'FORM' | 'SUBMITTING' | 'SUCCESS';

export interface MapViewState {
  zoom: number;
  pitch: number;
  bearing: number;
}
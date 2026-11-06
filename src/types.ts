export interface Location {
  lat: number;
  lon: number;
  label: string;
}

export type CityId = 'nuremberg' | 'bucharest';

export interface City {
  id: CityId;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export type TransportModeId =
  | 'walk'
  | 'bike'
  | 'ebike'
  | 'train'
  | 'bus'
  | 'ev'
  | 'car'
  | 'delivery';

export type ModeIconName =
  | 'walk'
  | 'bike'
  | 'train'
  | 'bus'
  | 'zap'
  | 'car'
  | 'package';

export interface TransportMode {
  id: TransportModeId;
  name: string;
  shortName: string;
  icon: ModeIconName;
  color: string;
  speedKmh: number;
  emissionFactor: number;
  waitMinutes: number;
  description: string;
}

export interface EmissionFactors {
  walking: number;
  cycling: number;
  ebike: number;
  train: number;
  bus: number;
  ev: number;
  car: number;
  delivery: number;
}

export interface Store {
  id: string;
  name: string;
  brand: string;
  category: string;
  address: string;
  location: {
    lat: number;
    lon: number;
  };
  distanceKm: number;
  tags: Record<string, string>;
  imageUrl?: string;
  openingHours?: string;
  website?: string;
  phone?: string;
  isFallback?: boolean;
  verifiedGreen?: boolean;
}

export interface RouteOption {
  mode: TransportModeId;
  modeName: string;
  shortName: string;
  icon: ModeIconName;
  color: string;
  description: string;
  distanceKm: number;
  durationMinutes: number;
  emissionsGrams: number;
  savingsGrams: number;
  savingsPercent: number;
  isGreenest: boolean;
  isDelivery: boolean;
  roundTrip: boolean;
  coordinates: Array<[number, number]>;
}

export interface StoreFetchResult {
  stores: Store[];
  source: 'osm' | 'fallback';
  notice?: string;
}

export interface ImpactState {
  totalSavingsGrams: number;
  tripsLogged: number;
  greenTrips: number;
  currentStreak: number;
  lastLoggedAt: number | null;
}

export interface StoreCategory {
  id: string;
  label: string;
  tags: string[];
  accent: string;
}

export interface LatLng {
  lat: number;
  lon: number;
}

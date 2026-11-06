import type {
  EmissionFactors,
  ModeIconName,
  RouteOption,
  TransportMode,
  TransportModeId,
} from '../types';

/**
 * Per-passenger emission factors in grams of CO2e per kilometre.
 * Values follow the ranges in the workshop brief (UK GHG conversion factors).
 * The online delivery value is a flat consolidated last-mile baseline in grams.
 */
export const EMISSION_FACTORS: EmissionFactors = {
  walking: 0,
  cycling: 0,
  train: 35,
  bus: 90,
  car: 170,
  delivery: 120,
};

export const TRANSPORT_MODES: TransportMode[] = [
  {
    id: 'walk',
    name: 'Walking',
    shortName: 'Walk',
    icon: 'walk',
    color: '#34d399',
    speedKmh: 4.8,
    emissionFactor: EMISSION_FACTORS.walking,
    waitMinutes: 0,
    description: 'Zero-emission, healthiest option. Best for shops under 2 km.',
  },
  {
    id: 'bike',
    name: 'Cycling',
    shortName: 'Bike',
    icon: 'bike',
    color: '#a3e635',
    speedKmh: 15,
    emissionFactor: EMISSION_FACTORS.cycling,
    waitMinutes: 0,
    description: 'Zero tailpipe emissions and usually the fastest short trip.',
  },
  {
    id: 'train',
    name: 'Train / tram',
    shortName: 'Train',
    icon: 'train',
    color: '#22d3ee',
    speedKmh: 32,
    emissionFactor: EMISSION_FACTORS.train,
    waitMinutes: 7,
    description: 'Low-carbon public transport with a short wait included.',
  },
  {
    id: 'bus',
    name: 'Bus',
    shortName: 'Bus',
    icon: 'bus',
    color: '#fbbf24',
    speedKmh: 19,
    emissionFactor: EMISSION_FACTORS.bus,
    waitMinutes: 5,
    description: 'Shared transport, higher emissions than rail but still efficient.',
  },
  {
    id: 'car',
    name: 'Car (solo)',
    shortName: 'Car',
    icon: 'car',
    color: '#fb7185',
    speedKmh: 30,
    emissionFactor: EMISSION_FACTORS.car,
    waitMinutes: 2,
    description: 'The baseline we compare against — one person, one petrol car.',
  },
  {
    id: 'delivery',
    name: 'Online delivery',
    shortName: 'Delivery',
    icon: 'package',
    color: '#c084fc',
    speedKmh: 0,
    emissionFactor: EMISSION_FACTORS.delivery,
    waitMinutes: 0,
    description: 'Consolidated van delivery, many parcels per route (~120 g flat).',
  },
];

const MODE_MAP = new Map<TransportModeId, TransportMode>(
  TRANSPORT_MODES.map((mode) => [mode.id, mode]),
);

export function getTransportMode(id: TransportModeId): TransportMode {
  const mode = MODE_MAP.get(id);
  if (!mode) throw new Error(`Unknown transport mode: ${id}`);
  return mode;
}

export function calculateEmissions(mode: TransportModeId, distanceKm: number): number {
  const factor = getTransportMode(mode).emissionFactor;
  if (mode === 'delivery') return EMISSION_FACTORS.delivery;
  return Math.max(0, distanceKm) * factor;
}

export function calculateSavings(
  mode: TransportModeId,
  distanceKm: number,
  baselineMode: TransportModeId = 'car',
): number {
  return (
    calculateEmissions(baselineMode, distanceKm) -
    calculateEmissions(mode, distanceKm)
  );
}

export function buildRouteOptions(
  oneWayDistanceKm: number,
  coordinates: Array<[number, number]>,
): RouteOption[] {
  const distanceKm = Math.max(0, oneWayDistanceKm);
  const roundTripKm = distanceKm * 2;
  const carBaseline = calculateEmissions('car', roundTripKm);

  const options = TRANSPORT_MODES.map<RouteOption>((mode) => {
    const isDelivery = mode.id === 'delivery';
    const emissionsGrams = isDelivery
      ? EMISSION_FACTORS.delivery
      : calculateEmissions(mode.id, roundTripKm);

    const durationMinutes = isDelivery
      ? 24 * 60
      : (roundTripKm / Math.max(mode.speedKmh, 1)) * 60 + mode.waitMinutes;

    const savingsGrams = carBaseline - emissionsGrams;
    const savingsPercent =
      carBaseline > 0 ? (savingsGrams / carBaseline) * 100 : 0;

    return {
      mode: mode.id,
      modeName: mode.name,
      shortName: mode.shortName,
      icon: mode.icon as ModeIconName,
      color: mode.color,
      description: mode.description,
      distanceKm: isDelivery ? 0 : roundTripKm,
      durationMinutes,
      emissionsGrams,
      savingsGrams,
      savingsPercent,
      isGreenest: false,
      isDelivery,
      roundTrip: !isDelivery,
      coordinates: isDelivery ? [] : coordinates,
    };
  });

  const lowest = Math.min(...options.map((option) => option.emissionsGrams));
  for (const option of options) {
    option.isGreenest = Math.abs(option.emissionsGrams - lowest) < 0.5;
  }

  return options;
}

export function formatEmissions(grams: number): string {
  const value = Math.abs(grams);
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kg`;
  }
  return `${Math.round(value)} g`;
}

export function formatSignedEmissions(grams: number): string {
  const rounded = Math.abs(grams) < 1 ? 0 : Math.round(Math.abs(grams));
  const text =
    rounded >= 1000 ? `${(rounded / 1000).toFixed(2)} kg` : `${rounded} g`;
  if (rounded === 0) return '0 g';
  return grams > 0 ? `−${text}` : `+${text}`;
}

export function formatDuration(minutes: number): string {
  if (minutes >= 20 * 60) return 'Next day';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
  }
  return `${Math.max(1, Math.round(minutes))} min`;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm <= 0) return '—';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

import type { LatLng, RouteOption, Store } from '../types';
import { buildRouteOptions } from './emissionService';
import { haversineKm } from './storeService';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
const STRAIGHT_LINE_ROAD_FACTOR = 1.32;
const ROUTE_TIMEOUT_MS = 5500;

interface OsrmResponse {
  code?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
}

interface RoadRoute {
  distanceKm: number;
  coordinates: Array<[number, number]>;
  estimated: boolean;
}

const routeCache = new Map<string, RoadRoute>();

function cacheKey(from: LatLng, to: LatLng): string {
  return [
    from.lat.toFixed(5),
    from.lon.toFixed(5),
    to.lat.toFixed(5),
    to.lon.toFixed(5),
  ].join(':');
}

/**
 * Creates a gently curved fallback line so the map still communicates a route
 * when OSRM is unavailable. Distances use a road-network correction factor.
 */
function estimateCoordinates(
  from: LatLng,
  to: LatLng,
  steps = 28,
): Array<[number, number]> {
  const dLat = to.lat - from.lat;
  const dLon = to.lon - from.lon;
  const length = Math.hypot(dLat, dLon) || 1;
  const bend = length * 0.09;
  const perpLat = (-dLon / length) * bend;
  const perpLon = (dLat / length) * bend;

  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const curve = Math.sin(Math.PI * t);
    return [
      from.lat + dLat * t + perpLat * curve,
      from.lon + dLon * t + perpLon * curve,
    ] as [number, number];
  });
}

function estimateRoute(from: LatLng, to: LatLng): RoadRoute {
  return {
    distanceKm: haversineKm(from, to) * STRAIGHT_LINE_ROAD_FACTOR,
    coordinates: estimateCoordinates(from, to),
    estimated: true,
  };
}

async function fetchOsrmRoute(from: LatLng, to: LatLng): Promise<RoadRoute | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ROUTE_TIMEOUT_MS);

  try {
    const url = `${OSRM_BASE}/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;

    const data = (await response.json()) as OsrmResponse;
    const route = data.routes?.[0];
    const coordinates = route?.geometry?.coordinates;

    if (
      data.code !== 'Ok' ||
      !route ||
      !coordinates ||
      coordinates.length < 2 ||
      !Number.isFinite(route.distance)
    ) {
      return null;
    }

    const straightLine = haversineKm(from, to);
    const distanceKm = Math.max(
      route.distance / 1000,
      straightLine * 1.05,
      0.05,
    );

    return {
      distanceKm,
      coordinates: coordinates.map(
        ([lon, lat]) => [lat, lon] as [number, number],
      ),
      estimated: false,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function getRoadRoute(from: LatLng, to: LatLng): Promise<RoadRoute> {
  const key = cacheKey(from, to);
  const cached = routeCache.get(key);
  if (cached) return cached;

  const osrmRoute = await fetchOsrmRoute(from, to);
  const route = osrmRoute ?? estimateRoute(from, to);
  routeCache.set(key, route);
  return route;
}

export async function buildRouteOptionsForStore(
  store: Store,
  userLocation: LatLng,
): Promise<RouteOption[]> {
  const route = await getRoadRoute(userLocation, store.location);
  return buildRouteOptions(route.distanceKm, route.coordinates);
}

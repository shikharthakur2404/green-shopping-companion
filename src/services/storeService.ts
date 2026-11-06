import type {
  City,
  Location,
  Store,
  StoreCategory,
  StoreFetchResult,
} from '../types';
import { titleCase } from '../lib/utils';

export const CITIES: City[] = [
  {
    id: 'nuremberg',
    name: 'Nuremberg',
    country: 'Germany',
    lat: 49.4521,
    lon: 11.0767,
  },
  {
    id: 'bucharest',
    name: 'Bucharest',
    country: 'Romania',
    lat: 44.4268,
    lon: 26.1025,
  },
];

export const ALL_CATEGORY_ID = 'all';

export const STORE_CATEGORIES: StoreCategory[] = [
  { id: 'all', label: 'All shops', tags: [], accent: '#34d399' },
  { id: 'clothes', label: 'Fashion', tags: ['clothes', 'fashion'], accent: '#f472b6' },
  { id: 'shoes', label: 'Shoes', tags: ['shoes'], accent: '#fb923c' },
  {
    id: 'department_store',
    label: 'Department',
    tags: ['department_store'],
    accent: '#a78bfa',
  },
  {
    id: 'supermarket',
    label: 'Groceries',
    tags: ['supermarket', 'convenience', 'greengrocer'],
    accent: '#4ade80',
  },
  { id: 'mall', label: 'Malls', tags: ['mall', 'marketplace'], accent: '#22d3ee' },
  {
    id: 'sports',
    label: 'Sports',
    tags: ['sports', 'outdoor'],
    accent: '#a3e635',
  },
  {
    id: 'second_hand',
    label: 'Second-hand',
    tags: ['second_hand', 'charity'],
    accent: '#fbbf24',
  },
];

const OSM_SHOP_TAGS = [
  'clothes',
  'shoes',
  'department_store',
  'supermarket',
  'convenience',
  'mall',
  'sports',
  'outdoor',
  'bag',
  'bags',
  'jewelry',
  'second_hand',
  'charity',
  'books',
  'gift',
  'furniture',
  'electronics',
  'cosmetics',
  'perfumery',
  'toys',
  'optician',
  'greengrocer',
];

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const SEARCH_RADIUS_M = 5000;

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

export function haversineKm(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function buildAddress(tags: Record<string, string>): string {
  const street = [tags['addr:street'], tags['addr:housenumber']]
    .filter(Boolean)
    .join(' ');
  const city = [tags['addr:postcode'], tags['addr:city']]
    .filter(Boolean)
    .join(' ');
  const address = [street, city].filter(Boolean).join(', ');
  return address || tags['addr:full'] || 'Address not listed';
}

function buildStore(
  element: OverpassElement,
  userLocation: Location,
  isFallback = false,
): Store | null {
  const tags = element.tags ?? {};
  const name = tags.name ?? tags.brand ?? tags.operator;
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (!name || lat === undefined || lon === undefined) return null;

  return {
    id: `${element.type}/${element.id}`,
    name,
    brand: tags.brand ?? tags.operator ?? name,
    category: tags.shop ?? tags.amenity ?? 'shop',
    address: buildAddress(tags),
    location: { lat, lon },
    distanceKm: haversineKm(userLocation, { lat, lon }),
    tags,
    openingHours: tags.opening_hours,
    website: tags.website ?? tags['contact:website'],
    phone: tags.phone ?? tags['contact:phone'],
    isFallback,
  };
}

function dedupeStores(stores: Store[]): Store[] {
  const seen = new Set<string>();
  return stores.filter((store) => {
    const key = `${store.name.toLowerCase()}-${store.location.lat.toFixed(4)}-${store.location.lon.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByDistance(stores: Store[]): Store[] {
  return [...stores].sort((a, b) => a.distanceKm - b.distanceKm);
}

function createSampleStore(
  id: string,
  name: string,
  brand: string,
  category: string,
  address: string,
  lat: number,
  lon: number,
  products: string,
  openingHours = 'Mo–Sa 10:00–20:00',
): Store {
  return {
    id,
    name,
    brand,
    category,
    address,
    location: { lat, lon },
    distanceKm: 0,
    tags: {
      shop: category,
      brand,
      products,
      opening_hours: openingHours,
    },
    openingHours,
    isFallback: true,
  };
}

function nurembergSamples(): Store[] {
  return [
    createSampleStore(
      'sample-nbg-adidas',
      'Adidas Store Nuremberg',
      'Adidas',
      'clothes',
      'Karolinenstraße 32, 90402 Nürnberg',
      49.45184,
      11.07525,
      'shoes trainers sportswear football jerseys',
    ),
    createSampleStore(
      'sample-nbg-zara',
      'Zara',
      'Zara',
      'clothes',
      'Karolinenstraße 30, 90402 Nürnberg',
      49.45161,
      11.07593,
      'jeans jackets dresses shirts shoes',
    ),
    createSampleStore(
      'sample-nbg-hm',
      'H&M',
      'H&M',
      'clothes',
      'Karolinenstraße 25, 90402 Nürnberg',
      49.45122,
      11.07628,
      'jeans basics underwear bras dresses',
    ),
    createSampleStore(
      'sample-nbg-ca',
      'C&A',
      'C&A',
      'clothes',
      'Karolinenstraße 29, 90402 Nürnberg',
      49.45143,
      11.07622,
      'underwear jeans shirts basics',
    ),
    createSampleStore(
      'sample-nbg-breuninger',
      'Breuninger',
      'Breuninger',
      'department_store',
      'Königstraße 1, 90402 Nürnberg',
      49.45239,
      11.07658,
      'fashion shoes cosmetics designer',
    ),
    createSampleStore(
      'sample-nbg-galeria',
      'Galeria',
      'Galeria',
      'department_store',
      'Königstraße 2, 90402 Nürnberg',
      49.45244,
      11.07791,
      'clothes shoes homeware cosmetics',
    ),
    createSampleStore(
      'sample-nbg-deichmann',
      'Deichmann',
      'Deichmann',
      'shoes',
      'Breite Gasse 42, 90402 Nürnberg',
      49.45106,
      11.07544,
      'shoes boots sandals trainers',
    ),
    createSampleStore(
      'sample-nbg-decathlon',
      'Decathlon Nuremberg',
      'Decathlon',
      'sports',
      'Äußere Bayreuther Straße 10, 90489 Nürnberg',
      49.46561,
      11.09943,
      'sports outdoor shoes hiking cycling',
    ),
    createSampleStore(
      'sample-nbg-edeka',
      'EDEKA Karolinenstraße',
      'EDEKA',
      'supermarket',
      'Karolinenstraße 40, 90402 Nürnberg',
      49.45112,
      11.07436,
      'groceries food weekly shopping',
      'Mo–Sa 07:00–20:00',
    ),
    createSampleStore(
      'sample-nbg-tkmaxx',
      'TK Maxx',
      'TK Maxx',
      'clothes',
      'Karolinenstraße 20, 90402 Nürnberg',
      49.45091,
      11.07679,
      'discount fashion shoes bags jeans',
    ),
    createSampleStore(
      'sample-nbg-lush',
      'Lush',
      'Lush',
      'cosmetics',
      'Karolinenstraße 12, 90402 Nürnberg',
      49.45052,
      11.07696,
      'cosmetics soap shampoo gifts',
    ),
    createSampleStore(
      'sample-nbg-vintage',
      'Vintage & Rework',
      'Second Hand',
      'second_hand',
      'Weiße Gasse 8, 90402 Nürnberg',
      49.45075,
      11.07812,
      'second hand vintage jeans jackets',
      'Mo–Sa 11:00–19:00',
    ),
  ];
}

function bucharestSamples(): Store[] {
  return [
    createSampleStore(
      'sample-buh-adidas',
      'Adidas Store Bucharest',
      'Adidas',
      'clothes',
      'Calea Victoriei 155, București',
      44.44421,
      26.09655,
      'shoes trainers sportswear football jerseys',
    ),
    createSampleStore(
      'sample-buh-zara',
      'Zara',
      'Zara',
      'clothes',
      'Calea Victoriei 142, București',
      44.44282,
      26.09728,
      'jeans jackets dresses shirts shoes',
    ),
    createSampleStore(
      'sample-buh-hm',
      'H&M',
      'H&M',
      'clothes',
      'Calea Victoriei 168, București',
      44.44074,
      26.09855,
      'jeans basics underwear bras dresses',
    ),
    createSampleStore(
      'sample-buh-ca',
      'C&A Bucharest',
      'C&A',
      'clothes',
      'Bulevardul Unirii 22, București',
      44.42673,
      26.10533,
      'underwear jeans shirts basics',
    ),
    createSampleStore(
      'sample-buh-nike',
      'Nike Store',
      'Nike',
      'shoes',
      'AFI Cotroceni, Bulevardul Timișoara 26, București',
      44.43104,
      26.05228,
      'shoes trainers running sportswear',
    ),
    createSampleStore(
      'sample-buh-deichmann',
      'Deichmann',
      'Deichmann',
      'shoes',
      'Bulevardul Unirii 12, București',
      44.42754,
      26.10274,
      'shoes boots sandals trainers',
    ),
    createSampleStore(
      'sample-buh-decathlon',
      'Decathlon Bucharest',
      'Decathlon',
      'sports',
      'Strada Fabrica de Glucoză 15, București',
      44.47799,
      26.10703,
      'sports outdoor shoes hiking cycling',
    ),
    createSampleStore(
      'sample-buh-mega',
      'Mega Image',
      'Mega Image',
      'supermarket',
      'Calea Victoriei 100, București',
      44.44513,
      26.09679,
      'groceries food weekly shopping',
      'Daily 07:00–23:00',
    ),
    createSampleStore(
      'sample-buh-carrefour',
      'Carrefour Vitan',
      'Carrefour',
      'supermarket',
      'Calea Vitan 236, București',
      44.41688,
      26.13015,
      'groceries food weekly shopping',
      'Daily 08:00–22:00',
    ),
    createSampleStore(
      'sample-buh-baneasa',
      'Băneasa Shopping City',
      'Băneasa',
      'mall',
      'Șoseaua București–Ploiești 42D, București',
      44.50969,
      26.08321,
      'mall fashion shoes electronics cinema',
    ),
    createSampleStore(
      'sample-buh-galeria',
      'Galeria Bucharest',
      'Galeria',
      'department_store',
      'Calea Victoriei 132, București',
      44.44342,
      26.09723,
      'fashion shoes cosmetics homeware',
    ),
    createSampleStore(
      'sample-buh-vintage',
      'Retro Vintage Shop',
      'Second Hand',
      'second_hand',
      'Strada Doamnei 20, București',
      44.43221,
      26.10068,
      'second hand vintage jeans jackets',
      'Mon–Sat 11:00–19:00',
    ),
  ];
}

function syntheticSamples(location: Location): Store[] {
  const templates = [
    ['Adidas Store', 'Adidas', 'clothes', 'shoes trainers sportswear', 0.0022, 0.0018],
    ['Zara', 'Zara', 'clothes', 'jeans jackets dresses shoes', -0.0028, 0.0024],
    ['H&M', 'H&M', 'clothes', 'jeans basics underwear', 0.0041, -0.0021],
    ['Deichmann', 'Deichmann', 'shoes', 'shoes boots sandals trainers', -0.0014, -0.0034],
    ['Decathlon', 'Decathlon', 'sports', 'sports outdoor shoes cycling', 0.0098, 0.0062],
    ['Galeria', 'Galeria', 'department_store', 'fashion shoes cosmetics homeware', -0.0062, 0.0058],
    ['EDEKA', 'EDEKA', 'supermarket', 'groceries food weekly shopping', 0.0036, 0.0071],
    ['Vintage Corner', 'Second Hand', 'second_hand', 'second hand vintage jeans', -0.0084, -0.0064],
  ] as const;

  return templates.map(([name, brand, category, products, dLat, dLon], index) =>
    createSampleStore(
      `sample-local-${index}`,
      `${name} (demo)`,
      brand,
      category,
      'Sample location near you',
      location.lat + dLat,
      location.lon + dLon,
      products,
    ),
  );
}

export function getFallbackStores(location: Location): Store[] {
  const nearestCity = CITIES.map((city) => ({
    city,
    distance: haversineKm(location, city),
  })).sort((a, b) => a.distance - b.distance)[0];

  let samples: Store[];
  if (nearestCity && nearestCity.distance < 35) {
    samples =
      nearestCity.city.id === 'nuremberg'
        ? nurembergSamples()
        : bucharestSamples();
  } else {
    samples = syntheticSamples(location);
  }

  return sortByDistance(
    samples.map((store) => ({
      ...store,
      distanceKm: haversineKm(location, store.location),
    })),
  );
}

function buildOverpassQuery(location: Location): string {
  const shopRegex = OSM_SHOP_TAGS.join('|');
  const around = `around:${SEARCH_RADIUS_M},${location.lat},${location.lon}`;
  return `
[out:json][timeout:18];
(
  nwr["shop"~"${shopRegex}" i](${around});
  nwr["amenity"="marketplace"](${around});
);
out center 80;
`.trim();
}

async function queryOverpass(
  endpoint: string,
  query: string,
  userLocation: Location,
): Promise<Store[]> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 5500);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Overpass responded with ${response.status}`);
    }

    const data = (await response.json()) as OverpassResponse;
    const stores = (data.elements ?? [])
      .map((element) => buildStore(element, userLocation))
      .filter((store): store is Store => store !== null);

    return sortByDistance(dedupeStores(stores)).slice(0, 80);
  } finally {
    window.clearTimeout(timer);
  }
}

export async function fetchNearbyStores(
  location: Location,
): Promise<StoreFetchResult> {
  const query = buildOverpassQuery(location);

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const stores = await queryOverpass(endpoint, query, location);
      if (stores.length >= 3) {
        return { stores, source: 'osm' };
      }
    } catch {
      // Try the next mirror, then fall back to curated demo data.
    }
  }

  return {
    stores: getFallbackStores(location),
    source: 'fallback',
    notice:
      'OpenStreetMap is slow or rate-limited right now, so we are showing a curated demo set. Distances and emissions are still real calculations.',
  };
}

export function storeMatchesQuery(store: Store, query: string): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = [
    store.name,
    store.brand,
    store.category,
    store.address,
    ...Object.values(store.tags),
  ]
    .join(' ')
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

export function storeMatchesCategory(store: Store, categoryId: string): boolean {
  if (categoryId === ALL_CATEGORY_ID) return true;
  const category = STORE_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) return true;
  return category.tags.includes(store.category);
}

export function getCategoryLabel(category: string): string {
  const match = STORE_CATEGORIES.find((item) => item.tags.includes(category));
  return match?.label ?? titleCase(category);
}

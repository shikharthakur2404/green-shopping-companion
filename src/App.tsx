import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen,
  Calculator,
  Compass,
  Leaf,
  Loader2,
  MapPin,
  Navigation,
  Radio,
  ShieldCheck,
  ShoppingBag,
  Store as StoreIcon,
  TrendingDown,
} from 'lucide-react';
import { Map } from './components/Map';
import { StoreSearch } from './components/StoreSearch';
import { RouteComparison } from './components/RouteComparison';
import { CarbonCalculator } from './components/CarbonCalculator';
import { EcoTracker } from './components/EcoTracker';
import { Methodology } from './components/Methodology';
import { cn } from './lib/utils';
import type {
  CityId,
  ImpactState,
  Location,
  RouteOption,
  Store,
  TransportModeId,
} from './types';
import {
  formatDistance,
  formatEmissions,
} from './services/emissionService';
import { buildRouteOptionsForStore } from './services/routingService';
import {
  ALL_CATEGORY_ID,
  CITIES,
  fetchNearbyStores,
  storeMatchesCategory,
  storeMatchesQuery,
} from './services/storeService';

const IMPACT_STORAGE_KEY = 'greenstep-impact-v1';

type TabId = 'find' | 'calculator' | 'tracker' | 'methodology';

const TABS: Array<{
  id: TabId;
  label: string;
  shortLabel: string;
  hint: string;
  icon: typeof Compass;
}> = [
  {
    id: 'find',
    label: 'Find & Compare',
    shortLabel: 'Find',
    hint: 'Stores & routes',
    icon: Compass,
  },
  {
    id: 'calculator',
    label: 'Carbon Calculator',
    shortLabel: 'Calculator',
    hint: 'Compare modes',
    icon: Calculator,
  },
  {
    id: 'tracker',
    label: 'My Eco Tracker',
    shortLabel: 'Tracker',
    hint: 'Impact & habits',
    icon: Leaf,
  },
  {
    id: 'methodology',
    label: 'Methodology & Sources',
    shortLabel: 'Sources',
    hint: 'Verified data',
    icon: BookOpen,
  },
];

function defaultImpact(): ImpactState {
  return {
    totalSavingsGrams: 0,
    tripsLogged: 0,
    greenTrips: 0,
    currentStreak: 0,
    lastLoggedAt: null,
  };
}

function loadImpact(): ImpactState {
  try {
    const raw = window.localStorage.getItem(IMPACT_STORAGE_KEY);
    if (!raw) return defaultImpact();
    const parsed = JSON.parse(raw) as Partial<ImpactState>;
    return {
      totalSavingsGrams: Number(parsed.totalSavingsGrams) || 0,
      tripsLogged: Number(parsed.tripsLogged) || 0,
      greenTrips: Number(parsed.greenTrips) || 0,
      currentStreak: Number(parsed.currentStreak) || 0,
      lastLoggedAt:
        typeof parsed.lastLoggedAt === 'number' ? parsed.lastLoggedAt : null,
    };
  } catch {
    return defaultImpact();
  }
}

function initialLocation(): Location {
  const city = CITIES[0];
  return { lat: city.lat, lon: city.lon, label: `${city.name}, ${city.country}` };
}

function pickDefaultStore(stores: Store[]): Store | null {
  if (stores.length === 0) return null;

  const meaningful = stores.filter((store) => store.distanceKm >= 0.6);
  const pool = meaningful.length > 0 ? meaningful : stores;
  const preferredCategories = new Set([
    'clothes',
    'shoes',
    'department_store',
    'sports',
  ]);

  return (
    pool.find((store) => preferredCategories.has(store.category)) ??
    pool[0] ??
    stores[0]
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  accent = '#34d399',
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent?: string;
}) {
  return (
    <div className="hud-panel flex items-center gap-3 px-3.5 py-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
        style={{
          borderColor: `${accent}35`,
          backgroundColor: `${accent}12`,
          color: accent,
        }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="data-value truncate text-base font-semibold leading-tight text-emerald-50">
          {value}
        </p>
        <p className="truncate text-[10px] uppercase tracking-[0.12em] text-emerald-100/35">
          {label}
        </p>
        <p className="truncate text-[10px] text-emerald-100/25">{hint}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('find');

  const [cityId, setCityId] = useState<CityId>(CITIES[0].id);
  const [userLocation, setUserLocation] = useState<Location>(initialLocation);
  const [usingGeolocation, setUsingGeolocation] = useState(false);
  const [locating, setLocating] = useState(false);

  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [source, setSource] = useState<'osm' | 'fallback' | null>(null);
  const [notice, setNotice] = useState<string | undefined>();
  const [reloadToken, setReloadToken] = useState(0);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORY_ID);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const [options, setOptions] = useState<RouteOption[] | null>(null);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<TransportModeId | null>(null);
  const [loggedStoreId, setLoggedStoreId] = useState<string | null>(null);

  const [impact, setImpact] = useState<ImpactState>(loadImpact);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    let cancelled = false;
    setStoresLoading(true);
    setNotice(undefined);

    fetchNearbyStores(userLocation)
      .then((result) => {
        if (cancelled) return;
        setStores(result.stores);
        setSource(result.source);
        setNotice(result.notice);
        setSelectedStore((previous) => {
          if (!previous) return pickDefaultStore(result.stores);
          return (
            result.stores.find((store) => store.id === previous.id) ??
            pickDefaultStore(result.stores)
          );
        });
      })
      .catch(() => {
        if (cancelled) return;
        setStores([]);
        setSource('fallback');
        setNotice('Could not load shops. Check your connection and try again.');
      })
      .finally(() => {
        if (!cancelled) setStoresLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userLocation, reloadToken]);

  useEffect(() => {
    if (!selectedStore) {
      setOptions(null);
      setActiveMode(null);
      return;
    }

    let cancelled = false;
    setRoutesLoading(true);
    setOptions(null);
    setActiveMode(null);

    buildRouteOptionsForStore(selectedStore, userLocation)
      .then((routeOptions) => {
        if (cancelled) return;
        setOptions(routeOptions);
        const best =
          routeOptions.find(
            (option) => option.isGreenest && option.mode !== 'delivery',
          ) ??
          routeOptions.find((option) => option.isGreenest) ??
          routeOptions[0];
        setActiveMode(best?.mode ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setOptions(null);
        setNotice(
          'Route calculation failed. Pick another shop or retry the live search.',
        );
      })
      .finally(() => {
        if (!cancelled) setRoutesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStore, userLocation]);

  useEffect(() => {
    try {
      window.localStorage.setItem(IMPACT_STORAGE_KEY, JSON.stringify(impact));
    } catch {
      // Private mode or storage full — the tracker simply stays in memory.
    }
  }, [impact]);

  const filteredStores = useMemo(
    () =>
      stores.filter(
        (store) =>
          storeMatchesQuery(store, query) &&
          storeMatchesCategory(store, category),
      ),
    [stores, query, category],
  );

  const nearestStore = stores[0] ?? null;
  const activeRoute =
    options?.find((option) => option.mode === activeMode) ??
    options?.find((option) => option.isGreenest) ??
    options?.[0] ??
    null;
  const greenestRoute =
    options?.find((option) => option.isGreenest) ?? options?.[0] ?? null;
  const carRoute = options?.find((option) => option.mode === 'car') ?? null;
  const hasLogged = selectedStore?.id === loggedStoreId;

  function handleCityChange(nextCityId: CityId) {
    const city = CITIES.find((item) => item.id === nextCityId);
    if (!city) return;
    setCityId(nextCityId);
    setUsingGeolocation(false);
    setSelectedStore(null);
    setOptions(null);
    setUserLocation({
      lat: city.lat,
      lon: city.lon,
      label: `${city.name}, ${city.country}`,
    });
  }

  function handleLocate() {
    if (!('geolocation' in navigator)) {
      setNotice('Geolocation is not available in this browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUsingGeolocation(true);
        setSelectedStore(null);
        setOptions(null);
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          label: 'Your current location',
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setNotice(
          'Location permission was denied. Showing the selected city instead — no location data was stored.',
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  }

  function handleLogTrip() {
    if (!activeRoute || !selectedStore || hasLogged) return;

    const baseline = carRoute?.emissionsGrams ?? activeRoute.emissionsGrams;
    const isGreen = activeRoute.emissionsGrams < baseline;
    const now = Date.now();

    setImpact((previous) => {
      const sameDay = previous.lastLoggedAt
        ? new Date(previous.lastLoggedAt).toDateString() ===
          new Date(now).toDateString()
        : false;

      return {
        totalSavingsGrams:
          previous.totalSavingsGrams + Math.max(0, activeRoute.savingsGrams),
        tripsLogged: previous.tripsLogged + 1,
        greenTrips: previous.greenTrips + (isGreen ? 1 : 0),
        currentStreak: isGreen
          ? sameDay
            ? Math.max(previous.currentStreak, 1)
            : previous.currentStreak + 1
          : previous.currentStreak,
        lastLoggedAt: now,
      };
    });
    setLoggedStoreId(selectedStore.id);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-carbon-950 text-emerald-50">
      <div className="pointer-events-none fixed inset-0 bg-greenstep-grid opacity-[0.35]" />
      <div className="pointer-events-none fixed -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none fixed -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-lime-400/[0.06] blur-[120px]" />

      <header className="sticky top-0 z-[1000] border-b border-white/5 bg-carbon-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            <button
              type="button"
              onClick={() => setActiveTab('find')}
              className="flex items-center gap-3 text-left"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-600 shadow-glow">
                <Leaf className="h-5 w-5 text-carbon-950" />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-carbon-950 bg-lime-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-extrabold tracking-tight text-emerald-50">
                    GreenStep
                  </h1>
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Campus pilot
                  </span>
                </div>
                <p className="hidden text-[11px] text-emerald-100/40 sm:block">
                  Green Shopping Companion — shop close, travel smart.
                </p>
              </div>
            </button>

            <nav
              className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1 lg:flex"
              aria-label="Main navigation"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition',
                      active
                        ? 'bg-emerald-400 text-carbon-950 shadow-glow'
                        : 'text-emerald-100/55 hover:bg-white/5 hover:text-emerald-100/85',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 sm:flex lg:hidden xl:flex">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                <div className="max-w-[180px]">
                  <p className="text-[8px] uppercase tracking-[0.16em] text-emerald-100/30">
                    Origin
                  </p>
                  <p className="truncate text-[11px] font-medium text-emerald-100/75">
                    {usingGeolocation
                      ? 'Your current location'
                      : userLocation.label}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLocate}
                disabled={locating}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2.5 text-[11px] font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-400/15 disabled:cursor-wait disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Navigation className="h-3.5 w-3.5" />
                )}
                Locate
              </button>
            </div>
          </div>

          <nav
            className="-mx-1 flex gap-1 overflow-x-auto pb-2 lg:hidden"
            aria-label="Main navigation"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition',
                    active
                      ? 'bg-emerald-400 text-carbon-950'
                      : 'border border-white/10 bg-white/[0.03] text-emerald-100/55',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.shortLabel}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1560px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        {activeTab === 'find' && (
          <>
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <StatCard
                icon={<StoreIcon className="h-4 w-4" />}
                label="Shops nearby"
                value={`${stores.length}`}
                hint={source === 'osm' ? 'OpenStreetMap live' : 'Demo dataset'}
              />
              <StatCard
                icon={<MapPin className="h-4 w-4" />}
                label="Nearest shop"
                value={
                  nearestStore ? formatDistance(nearestStore.distanceKm) : '—'
                }
                hint={nearestStore?.name ?? 'Searching…'}
                accent="#22d3ee"
              />
              <StatCard
                icon={<Leaf className="h-4 w-4" />}
                label="Greenest trip"
                value={
                  greenestRoute
                    ? formatEmissions(greenestRoute.emissionsGrams)
                    : '—'
                }
                hint={greenestRoute?.modeName ?? 'Select a shop'}
                accent="#a3e635"
              />
              <StatCard
                icon={<TrendingDown className="h-4 w-4" />}
                label="Save vs solo car"
                value={
                  greenestRoute
                    ? formatEmissions(Math.max(0, greenestRoute.savingsGrams))
                    : '—'
                }
                hint={
                  carRoute
                    ? `Car trip = ${formatEmissions(carRoute.emissionsGrams)}`
                    : 'Round trip comparison'
                }
                accent="#fb7185"
              />
            </div>

            <main className="mt-4 grid gap-4 lg:grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <StoreSearch
                  query={query}
                  onQueryChange={setQuery}
                  category={category}
                  onCategoryChange={setCategory}
                  stores={filteredStores}
                  totalStores={stores.length}
                  selectedStore={selectedStore}
                  onSelectStore={setSelectedStore}
                  loading={storesLoading}
                  locating={locating}
                  usingGeolocation={usingGeolocation}
                  source={source}
                  notice={notice}
                  cityId={cityId}
                  onCityChange={handleCityChange}
                  onLocate={handleLocate}
                  onRetry={() => setReloadToken((value) => value + 1)}
                />

                <button
                  type="button"
                  onClick={() => setActiveTab('calculator')}
                  className="hud-panel group flex w-full items-center justify-between gap-3 p-4 text-left transition hover:border-emerald-400/30 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                      <Calculator className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-emerald-50">
                        Compare any distance
                      </p>
                      <p className="text-[11px] text-emerald-100/40">
                        Open the standalone carbon calculator
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-300 transition group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </aside>

              <section className="space-y-4">
                <div className="relative">
                  <Map
                    userLocation={userLocation}
                    stores={stores}
                    selectedStore={selectedStore}
                    activeRoute={activeRoute}
                    onSelectStore={setSelectedStore}
                    className="h-[380px] sm:h-[460px] xl:h-[520px]"
                  />

                  <div className="pointer-events-none absolute left-3 top-3 z-[800] rounded-2xl border border-emerald-400/15 bg-carbon-950/80 px-3 py-2 shadow-panel backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                        {source === 'osm' ? 'Live nearby scan' : 'Nearby scan'}
                      </p>
                    </div>
                    <p className="mt-1 text-xs font-medium text-emerald-50/80">
                      {stores.length} shops within 5 km
                    </p>
                    <p className="text-[10px] text-emerald-100/35">
                      {usingGeolocation
                        ? 'Around your location'
                        : userLocation.label}
                    </p>
                  </div>

                  {activeRoute && selectedStore && (
                    <div className="pointer-events-none absolute bottom-3 left-3 z-[800] max-w-[260px] rounded-2xl border border-white/10 bg-carbon-950/80 px-3 py-2.5 shadow-panel backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: activeRoute.color }}
                        />
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-100/40">
                          {activeRoute.modeName} route
                        </p>
                      </div>
                      <p className="mt-1 truncate text-xs font-medium text-emerald-50/85">
                        {selectedStore.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-emerald-100/40">
                        {activeRoute.isDelivery
                          ? `${formatEmissions(activeRoute.emissionsGrams)} · next-day parcel`
                          : `${formatEmissions(activeRoute.emissionsGrams)} · ${formatDistance(activeRoute.distanceKm)} round trip`}
                      </p>
                    </div>
                  )}

                  <div className="pointer-events-none absolute right-3 top-3 z-[800] hidden items-center gap-1.5 rounded-full border border-white/10 bg-carbon-950/80 px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-emerald-100/45 backdrop-blur-md sm:flex">
                    <Radio className="h-3 w-3 text-emerald-300" />
                    OSM · OSRM
                  </div>
                </div>

                <RouteComparison
                  store={selectedStore}
                  options={options}
                  loading={routesLoading}
                  activeMode={activeMode}
                  onSelectMode={setActiveMode}
                  onLogTrip={handleLogTrip}
                  hasLogged={hasLogged}
                />
              </section>
            </main>
          </>
        )}

        {activeTab === 'calculator' && <CarbonCalculator />}

        {activeTab === 'tracker' && (
          <EcoTracker
            impact={impact}
            onReset={() => {
              setImpact(defaultImpact());
              setLoggedStoreId(null);
            }}
          />
        )}

        {activeTab === 'methodology' && <Methodology />}

        <footer className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-4 text-[10px] text-emerald-100/25 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5">
            <ShoppingBag className="h-3 w-3" />
            OpenStreetMap · OSRM · UK DESNZ 2026/2025 · EEA. Estimates, not
            certified measurements.
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" />
            Location processed on-device. No account, no stored location.
          </p>
        </footer>
      </div>
    </div>
  );
}

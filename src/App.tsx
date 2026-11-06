import { useEffect, useMemo, useState } from 'react';
import { LocateFixed, ChevronDown } from 'lucide-react';
import { Map } from './components/Map';
import { StoreSearch } from './components/StoreSearch';
import { CarbonCalculator } from './components/CarbonCalculator';
import { EcoTracker } from './components/EcoTracker';
import { Methodology } from './components/Methodology';
import type {
  CityId,
  ImpactState,
  Location,
  RouteOption,
  Store,
  TransportModeId,
} from './types';
import { buildRouteOptionsForStore } from './services/routingService';
import {
  ALL_CATEGORY_ID,
  CITIES,
  fetchNearbyStores,
  storeMatchesCategory,
  storeMatchesQuery,
} from './services/storeService';
import { cn } from './lib/utils';

const IMPACT_STORAGE_KEY = 'greenstep-impact-v2';

type TabId = 'find' | 'calculator' | 'tracker' | 'methodology';

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
  return { lat: city.lat, lon: city.lon, label: `${city.name} (FAU Südstadt)` };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('find');
  const [, setCityId] = useState<CityId>(CITIES[0].id);
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
  const [cityMenuOpen, setCityMenuOpen] = useState(false);

  // Auto-request high accuracy browser geolocation on load
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUsingGeolocation(true);
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            label: 'Current location',
          });
        },
        () => {
          // Defaults gracefully to FAU Südstadt (Nuremberg)
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  }, []);

  // Fetch stores on location change
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
        setSelectedStore((prev) => {
          if (!prev) return result.stores[0] ?? null;
          return result.stores.find((s) => s.id === prev.id) ?? result.stores[0] ?? null;
        });
      })
      .catch(() => {
        if (cancelled) return;
        setStores([]);
        setSource('fallback');
        setNotice('Could not load shops. Check network and retry.');
      })
      .finally(() => {
        if (!cancelled) setStoresLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userLocation, reloadToken]);

  // Route calculation for selected store
  useEffect(() => {
    if (!selectedStore) {
      setOptions(null);
      setActiveMode(null);
      return;
    }

    let cancelled = false;
    setRoutesLoading(true);

    buildRouteOptionsForStore(selectedStore, userLocation)
      .then((routeOptions) => {
        if (cancelled) return;
        setOptions(routeOptions);
        const best =
          routeOptions.find((opt) => opt.isGreenest && opt.mode !== 'delivery') ??
          routeOptions.find((opt) => opt.isGreenest) ??
          routeOptions[0];
        setActiveMode(best?.mode ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setOptions(null);
      })
      .finally(() => {
        if (!cancelled) setRoutesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStore, userLocation]);

  // Save impact to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(IMPACT_STORAGE_KEY, JSON.stringify(impact));
    } catch {
      // Ignore in private browsing
    }
  }, [impact]);

  const filteredStores = useMemo(
    () =>
      stores.filter(
        (store) =>
          storeMatchesQuery(store, query) && storeMatchesCategory(store, category),
      ),
    [stores, query, category],
  );

  const activeRoute =
    options?.find((opt) => opt.mode === activeMode) ??
    options?.find((opt) => opt.isGreenest) ??
    options?.[0] ??
    null;

  const hasLogged = selectedStore?.id === loggedStoreId;

  function handleCitySelect(nextCityId: CityId) {
    const city = CITIES.find((c) => c.id === nextCityId);
    if (!city) return;
    setCityId(nextCityId);
    setUsingGeolocation(false);
    setCityMenuOpen(false);
    setUserLocation({
      lat: city.lat,
      lon: city.lon,
      label: nextCityId === 'nuremberg' ? 'FAU Südstadt' : 'Bucharest Center',
    });
  }

  function handleLocate() {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUsingGeolocation(true);
        setLocating(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          label: 'Current location',
        });
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 7000 },
    );
  }

  function handleLogTrip() {
    if (!selectedStore || !activeRoute || hasLogged) return;
    const savings = activeRoute.savingsGrams > 0 ? activeRoute.savingsGrams : 0;
    const isGreen = activeRoute.isGreenest || activeRoute.mode !== 'car';

    setImpact((prev) => ({
      totalSavingsGrams: prev.totalSavingsGrams + savings,
      tripsLogged: prev.tripsLogged + 1,
      greenTrips: prev.greenTrips + (isGreen ? 1 : 0),
      currentStreak: isGreen ? prev.currentStreak + 1 : 0,
      lastLoggedAt: Date.now(),
    }));
    setLoggedStoreId(selectedStore.id);
  }

  function handleResetImpact() {
    const fresh = defaultImpact();
    setImpact(fresh);
    try {
      window.localStorage.removeItem(IMPACT_STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-highlighter selection:text-ink">
      {/* Top Bar: Exactly 56px height, plain wordmark, text tabs with underline */}
      <header className="h-14 border-b border-hairline bg-surface px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left: Plain wordmark (no icon tile, no tagline) */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('find')}
            className="font-serif text-xl font-bold tracking-tight text-ink cursor-pointer hover:opacity-85 text-left"
          >
            GreenStep
          </button>

          {/* Navigation text tabs with underline on active */}
          <nav className="hidden sm:flex items-center gap-6 h-14" aria-label="Main tabs">
            <button
              type="button"
              onClick={() => setActiveTab('find')}
              className={cn(
                'h-14 flex items-center text-xs transition-colors cursor-pointer',
                activeTab === 'find'
                  ? 'border-b-2 border-ink text-ink font-semibold'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              Find & Compare
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={cn(
                'h-14 flex items-center text-xs transition-colors cursor-pointer',
                activeTab === 'calculator'
                  ? 'border-b-2 border-ink text-ink font-semibold'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              Calculator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={cn(
                'h-14 flex items-center text-xs transition-colors cursor-pointer',
                activeTab === 'tracker'
                  ? 'border-b-2 border-ink text-ink font-semibold'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              Eco Tracker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('methodology')}
              className={cn(
                'h-14 flex items-center text-xs transition-colors cursor-pointer',
                activeTab === 'methodology'
                  ? 'border-b-2 border-ink text-ink font-semibold'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              Methodology
            </button>
          </nav>
        </div>

        {/* Right: Location selector & locate button */}
        <div className="flex items-center gap-2">
          {/* Origin selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCityMenuOpen(!cityMenuOpen)}
              className="flex items-center gap-1 text-xs font-mono text-ink-muted hover:text-ink px-2 py-1 rounded-sm border border-hairline bg-paper cursor-pointer"
            >
              <span>From: {usingGeolocation ? 'Current GPS' : userLocation.label.replace(' (FAU Südstadt)', '')}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {cityMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-surface border border-hairline rounded-sm shadow-md py-1 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => handleCitySelect('nuremberg')}
                  className="w-full text-left px-3 py-1.5 hover:bg-paper font-sans text-ink"
                >
                  FAU Südstadt (Nuremberg)
                </button>
                <button
                  type="button"
                  onClick={() => handleCitySelect('bucharest')}
                  className="w-full text-left px-3 py-1.5 hover:bg-paper font-sans text-ink"
                >
                  Bucharest Center
                </button>
              </div>
            )}
          </div>

          {/* Locate Icon */}
          <button
            type="button"
            onClick={handleLocate}
            disabled={locating}
            className="p-1.5 rounded-sm border border-hairline bg-paper text-ink-muted hover:text-ink transition-colors cursor-pointer"
            title="Detect precise GPS location"
            aria-label="Detect precise GPS location"
          >
            <LocateFixed className={cn('h-3.5 w-3.5', locating && 'animate-spin text-forest')} />
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation */}
      <div className="sm:hidden border-b border-hairline bg-surface flex items-center justify-around text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('find')}
          className={cn('py-2 px-1', activeTab === 'find' ? 'border-b-2 border-ink font-semibold' : 'text-ink-muted')}
        >
          Find
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={cn('py-2 px-1', activeTab === 'calculator' ? 'border-b-2 border-ink font-semibold' : 'text-ink-muted')}
        >
          Calculator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tracker')}
          className={cn('py-2 px-1', activeTab === 'tracker' ? 'border-b-2 border-ink font-semibold' : 'text-ink-muted')}
        >
          Tracker
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('methodology')}
          className={cn('py-2 px-1', activeTab === 'methodology' ? 'border-b-2 border-ink font-semibold' : 'text-ink-muted')}
        >
          Methodology
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'find' && (
          <div className="h-[calc(100vh-56px)] flex flex-col md:flex-row overflow-hidden">
            {/* Left Column (~380px): Search, filters, dense list, in-place TripReceipt expansion */}
            <div className="order-2 md:order-1 h-[55vh] md:h-full md:w-[380px] lg:w-[410px] shrink-0">
              <StoreSearch
                stores={filteredStores}
                totalStores={stores.length}
                loading={storesLoading}
                source={source}
                notice={notice}
                query={query}
                onQueryChange={setQuery}
                category={category}
                onCategoryChange={setCategory}
                selectedStore={selectedStore}
                onSelectStore={setSelectedStore}
                onRetry={() => setReloadToken((t) => t + 1)}
                routeOptions={options}
                routesLoading={routesLoading}
                activeMode={activeMode}
                onSelectMode={setActiveMode}
                onLogTrip={handleLogTrip}
                hasLogged={hasLogged}
                userLocation={userLocation}
              />
            </div>

            {/* Right Map Canvas: Takes the rest of the viewport height */}
            <div className="order-1 md:order-2 flex-1 h-[45vh] md:h-full">
              <Map
                userLocation={userLocation}
                stores={filteredStores}
                selectedStore={selectedStore}
                activeRoute={activeRoute}
                onSelectStore={setSelectedStore}
              />
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="h-[calc(100vh-56px)] overflow-y-auto paper-scroll bg-paper">
            <CarbonCalculator />
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="h-[calc(100vh-56px)] overflow-y-auto paper-scroll bg-paper">
            <EcoTracker impact={impact} onReset={handleResetImpact} />
          </div>
        )}

        {activeTab === 'methodology' && (
          <div className="h-[calc(100vh-56px)] overflow-y-auto paper-scroll bg-paper">
            <Methodology />
          </div>
        )}
      </main>
    </div>
  );
}

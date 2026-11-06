import {
  BadgeCheck,
  ChevronRight,
  Footprints,
  Leaf,
  Loader2,
  LocateFixed,
  MapPin,
  RefreshCw,
  Search,
  Store as StoreIcon,
  TrainFront,
  X,
} from 'lucide-react';
import type { CityId, Store } from '../types';
import { cn } from '../lib/utils';
import {
  formatDistance,
  formatDuration,
  formatEmissions,
} from '../services/emissionService';
import {
  ALL_CATEGORY_ID,
  CITIES,
  STORE_CATEGORIES,
  getCategoryLabel,
} from '../services/storeService';

interface StoreSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  stores: Store[];
  totalStores: number;
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  loading: boolean;
  locating: boolean;
  usingGeolocation: boolean;
  source: 'osm' | 'fallback' | null;
  notice?: string;
  cityId: CityId;
  onCityChange: (city: CityId) => void;
  onLocate: () => void;
  onRetry: () => void;
}

function categoryAccent(category: string): string {
  return (
    STORE_CATEGORIES.find((item) => item.tags.includes(category))?.accent ??
    '#34d399'
  );
}

function carbonScore(distanceKm: number): {
  grade: string;
  color: string;
  carGrams: number;
} {
  const carGrams = distanceKm * 2 * 171;
  if (distanceKm <= 1) return { grade: 'A+', color: '#34d399', carGrams };
  if (distanceKm <= 2) return { grade: 'A', color: '#a3e635', carGrams };
  if (distanceKm <= 3.5) return { grade: 'B', color: '#fbbf24', carGrams };
  return { grade: 'C', color: '#fb923c', carGrams };
}

function StoreRow({
  store,
  active,
  onSelect,
}: {
  store: Store;
  active: boolean;
  onSelect: () => void;
}) {
  const accent = categoryAccent(store.category);
  const score = carbonScore(store.distanceKm);
  const walkMinutes = (store.distanceKm / 4.8) * 60;
  const transitMinutes = (store.distanceKm / 32) * 60 + 7;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-200',
        active
          ? 'border-emerald-400/50 bg-emerald-400/10 shadow-glow'
          : 'border-white/5 bg-white/[0.02] hover:border-emerald-400/25 hover:bg-white/[0.05]',
      )}
    >
      <span className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/25 via-carbon-800 to-carbon-950">
        {store.imageUrl && (
          <img
            src={store.imageUrl}
            alt={`${store.name} storefront`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.opacity = '0';
            }}
          />
        )}
        <span
          className="absolute inset-x-1 bottom-1 truncate rounded-md border px-1.5 py-0.5 text-center text-[8px] font-bold uppercase tracking-[0.1em] backdrop-blur-md"
          style={{
            borderColor: `${accent}55`,
            backgroundColor: `${accent}2e`,
            color: '#ecfdf5',
          }}
        >
          {getCategoryLabel(store.category)}
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-emerald-50">
            {store.name}
          </span>
          {store.verifiedGreen && (
            <BadgeCheck
              className="h-3.5 w-3.5 shrink-0 text-emerald-300"
              aria-label="Verified green listing"
            />
          )}
          {store.isFallback && (
            <span className="shrink-0 rounded-full border border-amber-300/20 bg-amber-300/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-amber-200/80">
              demo
            </span>
          )}
        </span>
        <span className="mt-1 block truncate text-[11px] text-emerald-100/40">
          {store.address}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-emerald-100/45">
          <span className="font-mono font-semibold tabular-nums text-emerald-300">
            {formatDistance(store.distanceKm)}
          </span>
          <span className="flex items-center gap-1">
            <Footprints className="h-3 w-3 text-emerald-400/70" />
            {formatDuration(walkMinutes)}
          </span>
          <span className="flex items-center gap-1">
            <TrainFront className="h-3 w-3 text-cyan-400/70" />
            {formatDuration(transitMinutes)}
          </span>
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {store.verifiedGreen && (
            <span className="pill border-emerald-400/25 bg-emerald-400/10 text-emerald-200/90">
              Verified green
            </span>
          )}
          <span
            className="pill"
            style={{
              borderColor: `${score.color}40`,
              backgroundColor: `${score.color}14`,
              color: score.color,
            }}
            title={`Estimated solo-car round trip: ${formatEmissions(score.carGrams)}`}
          >
            <Leaf className="h-2.5 w-2.5" />
            {score.grade} score
          </span>
        </span>
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-emerald-100/25 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-300" />
    </button>
  );
}

export function StoreSearch({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  stores,
  totalStores,
  selectedStore,
  onSelectStore,
  loading,
  locating,
  usingGeolocation,
  source,
  notice,
  cityId,
  onCityChange,
  onLocate,
  onRetry,
}: StoreSearchProps) {
  return (
    <section className="hud-panel p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="hud-eyebrow">Find &amp; compare</p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-emerald-50">
            Where are you shopping?
          </h2>
        </div>
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 transition hover:border-emerald-400/40 hover:bg-emerald-400/20 disabled:cursor-wait disabled:opacity-60"
          aria-label="Use my current location"
          title="Use my current location"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300/60" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search stores, brands (Adidas, Zara...) or items (shoes, jeans, coat)"
          className="h-12 w-full rounded-2xl border border-white/10 bg-carbon-950/60 pl-11 pr-10 text-[13px] text-emerald-50 placeholder:text-emerald-100/25 outline-none transition focus:border-emerald-400/50 focus:bg-carbon-950 focus:ring-2 focus:ring-emerald-400/10"
          aria-label="Search stores, brands or items"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-emerald-100/40 transition hover:bg-white/10 hover:text-emerald-100"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {STORE_CATEGORIES.map((item) => {
          const active = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onCategoryChange(item.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
                active
                  ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
                  : 'border-white/10 bg-white/[0.02] text-emerald-100/50 hover:border-white/15 hover:text-emerald-100/80',
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.accent }}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
        <div className="flex items-center gap-1">
          {CITIES.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => onCityChange(city.id)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition',
                cityId === city.id && !locating && !usingGeolocation
                  ? 'bg-emerald-400/15 text-emerald-200'
                  : 'text-emerald-100/40 hover:bg-white/5 hover:text-emerald-100/70',
              )}
            >
              {city.name}
            </button>
          ))}
        </div>

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
            source === 'osm'
              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
              : source === 'fallback'
                ? 'border-amber-300/20 bg-amber-300/10 text-amber-200'
                : 'border-white/10 bg-white/5 text-emerald-100/40',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              source === 'osm'
                ? 'bg-emerald-400'
                : source === 'fallback'
                  ? 'bg-amber-300'
                  : 'bg-emerald-100/30',
            )}
          />
          {loading
            ? 'Scanning OSM…'
            : source === 'osm'
              ? 'OpenStreetMap live'
              : source === 'fallback'
                ? 'Demo dataset'
                : 'Waiting'}
        </span>
      </div>

      {notice && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-2.5 text-[11px] leading-relaxed text-amber-100/70">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300/80" />
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-md p-1 text-amber-200/70 transition hover:bg-amber-300/10 hover:text-amber-200"
            aria-label="Retry live shop search"
            title="Retry live shop search"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-100/35">
        <span>
          {loading
            ? 'Looking for shops…'
            : `${stores.length} of ${totalStores} shops${
                query || category !== ALL_CATEGORY_ID ? ' match' : ' nearby'
              }`}
        </span>
        <span className="flex items-center gap-1">
          <StoreIcon className="h-3 w-3" />
          within 5 km
        </span>
      </div>

      <div className="mt-2 max-h-[430px] space-y-1.5 overflow-y-auto pr-1 greenstep-scroll">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-2.5"
            >
              <div className="h-[86px] w-[86px] animate-pulse rounded-xl bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
                <div className="h-2.5 w-full animate-pulse rounded bg-white/[0.03]" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/[0.03]" />
              </div>
            </div>
          ))
        ) : stores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
            <p className="text-sm font-semibold text-emerald-100/70">
              No matching shops
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-100/35">
              Try a brand like Adidas or Zara, or switch to the All shops
              category.
            </p>
          </div>
        ) : (
          stores.map((store) => (
            <StoreRow
              key={store.id}
              store={store}
              active={selectedStore?.id === store.id}
              onSelect={() => onSelectStore(store)}
            />
          ))
        )}
      </div>
    </section>
  );
}

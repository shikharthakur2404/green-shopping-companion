import { useMemo } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import type { Location, RouteOption, Store, TransportModeId } from '../types';
import { cn } from '../lib/utils';
import { TripReceipt } from './TripReceipt';
import {
  STORE_CATEGORIES,
  getCategoryLabel,
  haversineKm,
} from '../services/storeService';

interface StoreSearchProps {
  stores: Store[];
  totalStores: number;
  loading: boolean;
  source: 'osm' | 'fallback' | null;
  notice?: string;
  query: string;
  onQueryChange: (query: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  onRetry: () => void;
  routeOptions: RouteOption[] | null;
  routesLoading: boolean;
  activeMode: TransportModeId | null;
  onSelectMode: (mode: TransportModeId) => void;
  onLogTrip: () => void;
  hasLogged: boolean;
  userLocation: Location;
}

export function StoreSearch({
  stores,
  totalStores,
  loading,
  source,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  selectedStore,
  onSelectStore,
  onRetry,
  routeOptions,
  routesLoading,
  activeMode,
  onSelectMode,
  onLogTrip,
  hasLogged,
  userLocation,
}: StoreSearchProps) {
  // Live headline sentence computation
  const summarySentence = useMemo(() => {
    if (stores.length === 0) return 'No shops match your criteria.';
    const walkable = stores.filter(
      (s) => (s.distanceKm / 5) * 60 <= 15 || haversineKm(userLocation, s.location) <= 1.25,
    );
    const nearest = [...stores].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    const walkMin = Math.max(1, Math.round((nearest.distanceKm / 5) * 60));

    if (walkable.length > 0) {
      return `${walkable.length} of ${totalStores} shops within a 15-minute walk. Nearest: ${nearest.name}, ${walkMin} min on foot, 0 g CO₂e.`;
    }
    return `${stores.length} of ${totalStores} shops nearby. Nearest: ${nearest.name}, ${walkMin} min on foot, 0 g CO₂e.`;
  }, [stores, userLocation]);

  return (
    <aside className="w-full md:w-[380px] lg:w-[410px] shrink-0 border-r border-hairline bg-surface flex flex-col h-full overflow-hidden text-ink">
      {/* Top Search & Filter Control */}
      <div className="p-3.5 border-b border-hairline space-y-2.5 shrink-0 bg-surface">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search stores, brands (e.g. Adidas), or items…"
            className="w-full bg-paper border border-hairline rounded-sm pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-muted/60 focus:border-ink focus:bg-surface focus:outline-none"
          />
        </div>

        {/* Category Segmented Dropdown or Text Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 paper-scroll text-xs">
          {STORE_CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  'px-2 py-0.5 rounded-sm whitespace-nowrap text-[11px] transition-colors',
                  isActive
                    ? 'bg-ink text-surface font-medium'
                    : 'text-ink-muted hover:text-ink hover:bg-paper',
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Live Headline Sentence */}
        <p className="text-[11px] font-sans text-ink-muted leading-snug pt-0.5 border-t border-hairline/60">
          {loading ? 'Finding nearby shops…' : summarySentence}
        </p>
      </div>

      {/* Dense Store Rows with In-Place Trip Receipt Expansion */}
      <div className="flex-1 overflow-y-auto divide-y divide-hairline paper-scroll">
        {loading ? (
          <div className="p-6 text-center text-xs text-ink-muted font-mono">
            Scanning OpenStreetMap…
          </div>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-muted">
            <p className="font-serif text-sm text-ink mb-1">No matching shops found</p>
            <p>Try searching for a different brand or switch to all shops.</p>
          </div>
        ) : (
          stores.map((store) => {
            const isSelected = selectedStore?.id === store.id;
            const walkMinutes = Math.max(1, Math.round((store.distanceKm / 5) * 60));
            const initial = store.name.charAt(0).toUpperCase();

            return (
              <div key={store.id} className="transition-colors">
                {/* Store Row Header */}
                <button
                  type="button"
                  onClick={() => onSelectStore(store)}
                  className={cn(
                    'w-full text-left p-3 flex items-start justify-between gap-3 transition-colors',
                    isSelected ? 'bg-highlighter/30' : 'hover:bg-paper/70',
                  )}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Plain Monogram Glyph */}
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm font-serif text-xs font-bold border',
                        isSelected
                          ? 'border-ink bg-ink text-surface'
                          : 'border-hairline bg-paper text-ink',
                      )}
                    >
                      {initial}
                    </span>

                    <div className="min-w-0">
                      <p className="font-serif text-sm font-semibold text-ink leading-tight truncate">
                        {store.name}
                      </p>
                      <p className="text-[11px] text-ink-muted truncate mt-0.5">
                        {getCategoryLabel(store.category)} · {store.address}
                      </p>
                    </div>
                  </div>

                  {/* Walk time & Carbon */}
                  <div className="text-right shrink-0">
                    <p className="font-serif text-base font-bold text-ink leading-none">
                      {walkMinutes} <span className="text-[10px] font-sans font-normal text-ink-muted">min</span>
                    </p>
                    <p className="font-mono text-[10px] text-forest font-medium mt-0.5">
                      0 g on foot
                    </p>
                  </div>
                </button>

                {/* In-place Expanded Trip Receipt when selected */}
                {isSelected && (
                  <div className="p-3 pt-0 bg-surface/90 border-t border-hairline/60">
                    {routesLoading ? (
                      <div className="p-4 text-center text-xs font-mono text-ink-muted">
                        Calculating routed travel options…
                      </div>
                    ) : routeOptions && routeOptions.length > 0 ? (
                      <TripReceipt
                        store={store}
                        options={routeOptions}
                        activeMode={activeMode}
                        onSelectMode={onSelectMode}
                        onLogTrip={onLogTrip}
                        hasLogged={hasLogged}
                      />
                    ) : null}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Humble Footer: Demo data note with single retry control */}
      {source === 'fallback' && (
        <div className="p-2 border-t border-hairline bg-paper/60 flex items-center justify-between text-[10px] font-mono text-ink-muted">
          <span>Demo data</span>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 hover:text-ink underline cursor-pointer"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            Retry live scan
          </button>
        </div>
      )}
    </aside>
  );
}

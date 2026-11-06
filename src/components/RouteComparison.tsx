import {
  Bike,
  Bus,
  Car,
  Check,
  Clock,
  Footprints,
  Info,
  Leaf,
  Package,
  Route as RouteIcon,
  ShoppingBag,
  Sparkles,
  TrainFront,
  Truck,
  Zap,
} from 'lucide-react';
import type {
  ModeIconName,
  RouteOption,
  Store,
  TransportModeId,
} from '../types';
import { cn } from '../lib/utils';
import {
  formatDistance,
  formatDuration,
  formatEmissions,
  formatSignedEmissions,
} from '../services/emissionService';

interface RouteComparisonProps {
  store: Store | null;
  options: RouteOption[] | null;
  loading: boolean;
  activeMode: TransportModeId | null;
  onSelectMode: (mode: TransportModeId) => void;
  onLogTrip: () => void;
  hasLogged: boolean;
}

function ModeIcon({
  icon,
  className,
}: {
  icon: ModeIconName;
  className?: string;
}) {
  const icons = {
    walk: Footprints,
    bike: Bike,
    train: TrainFront,
    bus: Bus,
    zap: Zap,
    car: Car,
    package: Package,
  } as const;

  const Icon = icons[icon] ?? Footprints;
  return <Icon className={className} />;
}

function SavingLabel({ option }: { option: RouteOption }) {
  if (option.mode === 'car') {
    return <span className="text-rose-300/70">Baseline trip</span>;
  }

  if (option.savingsGrams > 0.5) {
    return (
      <span className="text-emerald-300">
        {formatSignedEmissions(option.savingsGrams)} vs car
      </span>
    );
  }

  if (option.savingsGrams < -0.5) {
    return (
      <span className="text-rose-300">
        {formatSignedEmissions(option.savingsGrams)} more than car
      </span>
    );
  }

  return <span className="text-emerald-100/50">Same as car</span>;
}

function LoadingState() {
  return (
    <section className="hud-panel p-5">
      <p className="hud-eyebrow">Step 02 · Carbon comparison</p>
      <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-emerald-50">
        Calculating your routes…
      </h2>
      <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-white/[0.03]"
          />
        ))}
      </div>
    </section>
  );
}

export function RouteComparison({
  store,
  options,
  loading,
  activeMode,
  onSelectMode,
  onLogTrip,
  hasLogged,
}: RouteComparisonProps) {
  if (loading) return <LoadingState />;

  const activeOption =
    options?.find((option) => option.mode === activeMode) ??
    options?.find((option) => option.isGreenest) ??
    options?.[0];

  const greenest = options?.find((option) => option.isGreenest);
  const carOption = options?.find((option) => option.mode === 'car');
  const delivery = options?.find((option) => option.mode === 'delivery');
  const inStoreGreenest = options
    ?.filter((option) => !option.isDelivery)
    .reduce<RouteOption | null>(
      (best, option) =>
        !best || option.emissionsGrams < best.emissionsGrams ? option : best,
      null,
    );
  const deliveryWinsVsCar =
    delivery && carOption && delivery.emissionsGrams < carOption.emissionsGrams;

  return (
    <section className="hud-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="hud-eyebrow">Step 02 · Carbon comparison</p>
          <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-emerald-50">
            {store ? 'Choose your route' : 'Pick a shop to compare routes'}
          </h2>
          {store && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-100/45">
              <ShoppingBag className="h-3.5 w-3.5 text-emerald-300/70" />
              {store.name}
              <span className="text-emerald-100/20">·</span>
              {formatDistance(store.distanceKm)} away
            </p>
          )}
        </div>

        {store && activeOption && (
          <button
            type="button"
            onClick={onLogTrip}
            disabled={hasLogged}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition',
              hasLogged
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300/70'
                : 'border-emerald-400/40 bg-emerald-400 text-carbon-950 hover:bg-emerald-300 hover:shadow-glow',
            )}
          >
            {hasLogged ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Trip logged
              </>
            ) : (
              <>
                <Leaf className="h-3.5 w-3.5" />
                Log this trip
              </>
            )}
          </button>
        )}
      </div>

      {!store || !options || options.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
          <RouteIcon className="mx-auto h-7 w-7 text-emerald-300/40" />
          <p className="mt-3 text-sm font-medium text-emerald-100/65">
            Select a nearby shop to see walking, cycling, transit, car and
            delivery side by side.
          </p>
        </div>
      ) : (
        <>
          {greenest && (
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-400/15 via-emerald-400/[0.06] to-transparent p-4">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl" />
              <div className="relative flex flex-wrap items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/15 text-emerald-300">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/70">
                    Greenest option
                  </p>
                  <p className="mt-0.5 font-display text-base font-semibold text-emerald-50">
                    {greenest.modeName}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-100/50">
                    {formatDuration(greenest.durationMinutes)} ·{' '}
                    {formatDistance(greenest.distanceKm)} round trip
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-semibold text-emerald-300">
                    {formatEmissions(greenest.emissionsGrams)}
                  </p>
                  <p className="text-[11px] text-emerald-100/45">
                    saves {formatEmissions(Math.max(0, greenest.savingsGrams))}{' '}
                    vs a solo car trip
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((option) => {
              const active = option.mode === activeOption?.mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  onClick={() => onSelectMode(option.mode)}
                  className={cn(
                    'group relative flex flex-col rounded-2xl border p-3 text-left transition-all duration-200',
                    active
                      ? 'bg-white/[0.06] shadow-panel'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]',
                  )}
                  style={
                    active
                      ? {
                          borderColor: `${option.color}70`,
                          boxShadow: `0 0 30px -16px ${option.color}`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: `${option.color}40`,
                        backgroundColor: `${option.color}14`,
                        color: option.color,
                      }}
                    >
                      <ModeIcon icon={option.icon} className="h-4 w-4" />
                    </span>
                    {option.isGreenest && (
                      <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-300">
                        Greenest
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 text-xs font-medium text-emerald-100/70">
                    {option.shortName}
                  </p>
                  <p
                    className="font-display text-lg font-semibold leading-tight"
                    style={{ color: option.color }}
                  >
                    {formatEmissions(option.emissionsGrams)}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight">
                    <SavingLabel option={option} />
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-1 border-t border-white/5 pt-2 text-[10px] text-emerald-100/40">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(option.durationMinutes)}
                    </span>
                    <span>{formatDistance(option.distanceKm)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full min-w-[420px] text-left text-[11px]">
              <thead className="bg-white/[0.03] text-[9px] uppercase tracking-[0.14em] text-emerald-100/35">
                <tr>
                  <th className="px-3 py-2 font-medium">Mode</th>
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">
                    Distance
                  </th>
                  <th className="px-3 py-2 text-right font-medium">CO₂e</th>
                  <th className="px-3 py-2 text-right font-medium">
                    vs solo car
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {options.map((option) => (
                  <tr
                    key={option.mode}
                    className={cn(
                      'transition-colors',
                      option.mode === activeOption?.mode
                        ? 'bg-emerald-400/[0.06]'
                        : 'hover:bg-white/[0.02]',
                    )}
                  >
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        <span className="font-medium text-emerald-100/75">
                          {option.modeName}
                        </span>
                        {option.isGreenest && (
                          <Leaf className="h-3 w-3 text-emerald-400" />
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-emerald-100/55">
                      {formatDuration(option.durationMinutes)}
                    </td>
                    <td className="hidden px-3 py-2 text-emerald-100/55 sm:table-cell">
                      {option.isDelivery
                        ? 'many parcels'
                        : formatDistance(option.distanceKm)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-emerald-100/80">
                      {formatEmissions(option.emissionsGrams)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {option.mode === 'car' ? (
                        <span className="text-rose-300/70">baseline</span>
                      ) : (
                        <span
                          className={
                            option.savingsGrams >= 0
                              ? 'text-emerald-300'
                              : 'text-rose-300'
                          }
                        >
                          {formatSignedEmissions(option.savingsGrams)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {delivery && inStoreGreenest && (
            <div className="mt-4 rounded-2xl border border-purple-300/15 bg-purple-300/[0.04] p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-300" />
                <p className="text-xs font-semibold text-purple-100/80">
                  Delivery vs in-store, honestly
                </p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-carbon-950/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-300/60">
                    In-store, car-free
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-100/80">
                    {inStoreGreenest.modeName} ·{' '}
                    {formatEmissions(inStoreGreenest.emissionsGrams)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-100/40">
                    {formatDuration(inStoreGreenest.durationMinutes)} round trip
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-carbon-950/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-purple-300/60">
                    Consolidated online order
                  </p>
                  <p className="mt-1 text-sm font-semibold text-purple-100/80">
                    {formatEmissions(delivery.emissionsGrams)} flat
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-100/40">
                    Next day · many parcels per van
                  </p>
                </div>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-emerald-100/45">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-300/70" />
                <span>
                  {deliveryWinsVsCar
                    ? 'A consolidated delivery beats driving to this shop on carbon — but returns and failed deliveries can erase that saving.'
                    : 'For this trip, going car-free in person is greener than a parcel. Returns and express shipping make delivery worse.'}{' '}
                  Walking or cycling stays the zero-carbon baseline.
                </span>
              </p>
            </div>
          )}

          <p className="mt-3 text-[10px] leading-relaxed text-emerald-100/25">
            Estimates use published per-passenger factors: tram/light rail 29
            g/km, local bus 89 g/km, EV 45 g/km, petrol car 171 g/km,
            walk/bike/e-bike 0 g/km, delivery 118 g flat per parcel. Distances
            are round trip unless marked otherwise.
          </p>
        </>
      )}
    </section>
  );
}

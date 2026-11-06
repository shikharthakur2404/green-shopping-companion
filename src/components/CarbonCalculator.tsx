import { useMemo, useState, type CSSProperties } from 'react';
import {
  Bike,
  Bus,
  Car,
  Footprints,
  Gauge,
  Info,
  Leaf,
  Package,
  Scale,
  Sparkles,
  TrainFront,
  Truck,
  Zap,
} from 'lucide-react';
import type { ModeIconName, TransportModeId } from '../types';
import {
  EMISSION_FACTORS,
  calculateEmissions,
  formatDuration,
  formatEmissions,
  getTransportMode,
} from '../services/emissionService';

interface CalculatorMode {
  id: TransportModeId;
  label: string;
  icon: ModeIconName;
  factorLabel: string;
}

const CALCULATOR_MODES: CalculatorMode[] = [
  {
    id: 'walk',
    label: 'Walking',
    icon: 'walk',
    factorLabel: '0 g / passenger-km',
  },
  {
    id: 'bike',
    label: 'Cycling',
    icon: 'bike',
    factorLabel: '0 g / passenger-km',
  },
  {
    id: 'ebike',
    label: 'E-Bike',
    icon: 'bike',
    factorLabel: '0 g / passenger-km',
  },
  {
    id: 'train',
    label: 'Public transit',
    icon: 'train',
    factorLabel: `${EMISSION_FACTORS.train} g / passenger-km`,
  },
  {
    id: 'ev',
    label: 'Electric vehicle',
    icon: 'zap',
    factorLabel: `${EMISSION_FACTORS.ev} g / km`,
  },
  {
    id: 'car',
    label: 'Petrol car',
    icon: 'car',
    factorLabel: `${EMISSION_FACTORS.car} g / km`,
  },
  {
    id: 'delivery',
    label: 'Online delivery',
    icon: 'package',
    factorLabel: `${EMISSION_FACTORS.delivery} g / parcel`,
  },
];

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

export function CarbonCalculator() {
  const [distanceKm, setDistanceKm] = useState(3);

  const rows = useMemo(
    () =>
      CALCULATOR_MODES.map((entry) => {
        const mode = getTransportMode(entry.id);
        const emissions = calculateEmissions(entry.id, distanceKm);
        const durationMinutes =
          entry.id === 'delivery'
            ? 24 * 60
            : (distanceKm / Math.max(mode.speedKmh, 1)) * 60 + mode.waitMinutes;
        return { ...entry, mode, emissions, durationMinutes };
      }),
    [distanceKm],
  );

  const maxEmissions = Math.max(...rows.map((row) => row.emissions), 1);
  const carRow = rows.find((row) => row.id === 'car');
  const deliveryRow = rows.find((row) => row.id === 'delivery');
  const transitRow = rows.find((row) => row.id === 'train');
  const carEmissions = carRow?.emissions ?? 0;
  const deliveryEmissions = deliveryRow?.emissions ?? 0;
  const transitEmissions = transitRow?.emissions ?? 0;
  const deliveryBeatsCar = deliveryEmissions < carEmissions;
  const deliveryBeatsTransit = deliveryEmissions < transitEmissions;
  const carDelta = Math.abs(carEmissions - deliveryEmissions);
  const transitDelta = Math.abs(transitEmissions - deliveryEmissions);
  const sliderProgress = ((distanceKm - 1) / 19) * 100;

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.14] via-white/[0.03] to-transparent p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="hud-eyebrow">Carbon calculator</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-emerald-50 sm:text-4xl">
              Put every option on the same scale.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/55">
              Drag the distance to see how walking, cycling, public transit, an
              EV, a petrol car and a consolidated parcel actually compare.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <div className="rounded-2xl border border-white/10 bg-carbon-950/50 px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-emerald-100/35">
                One-way
              </p>
              <p className="data-value mt-1 text-2xl font-semibold text-emerald-300">
                {distanceKm.toFixed(distanceKm % 1 === 0 ? 0 : 1)}
                <span className="ml-1 text-sm text-emerald-100/40">km</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-carbon-950/50 px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-emerald-100/35">
                Round trip
              </p>
              <p className="data-value mt-1 text-2xl font-semibold text-emerald-100/80">
                {(distanceKm * 2).toFixed(distanceKm % 1 === 0 ? 0 : 1)}
                <span className="ml-1 text-sm text-emerald-100/40">km</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="hud-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <Gauge className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-emerald-50">Trip distance</p>
              <p className="text-[11px] text-emerald-100/40">
                One-way shopping trip · 1 to 20 km
              </p>
            </div>
          </div>
          <span className="pill border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
            <Sparkles className="h-3 w-3" />
            Live calculation
          </span>
        </div>

        <div className="mt-5">
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={distanceKm}
            onChange={(event) => setDistanceKm(Number(event.target.value))}
            className="distance-slider"
            style={{ '--slider-progress': `${sliderProgress}%` } as CSSProperties}
            aria-label="Trip distance in kilometres"
          />
          <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-emerald-100/30">
            <span>1 km</span>
            <span>5 km</span>
            <span>10 km</span>
            <span>15 km</span>
            <span>20 km</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="hud-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="hud-eyebrow">Side by side</p>
              <h3 className="mt-1 font-display text-lg font-bold text-emerald-50">
                Emissions for this trip
              </h3>
            </div>
            <span className="hidden items-center gap-1.5 text-[10px] text-emerald-100/35 sm:flex">
              <Scale className="h-3.5 w-3.5" />
              Bars scaled to the highest emitter
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {rows.map((row) => {
              const width =
                row.emissions <= 0
                  ? 0
                  : Math.max((row.emissions / maxEmissions) * 100, 1.5);
              return (
                <div key={row.id}>
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                        style={{
                          borderColor: `${row.mode.color}45`,
                          backgroundColor: `${row.mode.color}14`,
                          color: row.mode.color,
                        }}
                      >
                        <ModeIcon icon={row.icon} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-emerald-50">
                          {row.label}
                        </p>
                        <p className="flex items-center gap-1.5 text-[10px] text-emerald-100/35">
                          <span>{row.factorLabel}</span>
                          <span className="text-emerald-100/15">·</span>
                          <span>
                            {formatDuration(
                              row.id === 'delivery'
                                ? row.durationMinutes
                                : (distanceKm / row.mode.speedKmh) * 60 +
                                    row.mode.waitMinutes,
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p
                      className="data-value shrink-0 text-sm font-semibold"
                      style={{ color: row.mode.color }}
                    >
                      {row.emissions <= 0
                        ? '0 g'
                        : formatEmissions(row.emissions)}
                    </p>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${width}%`,
                        backgroundColor: row.mode.color,
                        boxShadow: `0 0 18px -4px ${row.mode.color}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-4">
          <section className="relative overflow-hidden rounded-3xl border border-purple-300/20 bg-gradient-to-br from-purple-400/15 via-white/[0.03] to-transparent p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-300/25 bg-purple-300/10 text-purple-200">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-200/70">
                  Honest comparison
                </p>
                <p className="font-display text-sm font-bold text-emerald-50">
                  {deliveryBeatsCar
                    ? 'Local delivery beats the solo car trip'
                    : 'The solo car trip is lower here'}
                </p>
              </div>
            </div>

            <p className="mt-4 font-display text-xl font-bold leading-snug text-emerald-50">
              {deliveryBeatsCar
                ? `A consolidated parcel saves ${formatEmissions(carDelta)} versus driving ${distanceKm.toFixed(1)} km.`
                : `A consolidated parcel emits ${formatEmissions(carDelta)} more than this car trip.`}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-carbon-950/40 p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-rose-200/60">
                  Petrol car
                </p>
                <p className="data-value mt-1 text-sm font-semibold text-rose-200">
                  {formatEmissions(carEmissions)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-carbon-950/40 p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-purple-200/60">
                  Parcel
                </p>
                <p className="data-value mt-1 text-sm font-semibold text-purple-200">
                  {formatEmissions(deliveryEmissions)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-carbon-950/40 p-2.5">
                <p className="text-[9px] uppercase tracking-wide text-cyan-200/60">
                  Transit
                </p>
                <p className="data-value mt-1 text-sm font-semibold text-cyan-200">
                  {formatEmissions(transitEmissions)}
                </p>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-emerald-100/50">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-200/70" />
              <span>
                {deliveryBeatsTransit
                  ? `Even so, public transit is ${formatEmissions(transitDelta)} lower than the parcel. Walking or cycling stays at zero.`
                  : 'Public transit is higher than the parcel on this trip, but walk, cycle or e-bike remains zero-carbon.'}{' '}
                Returns, failed deliveries and express shipping can erase the
                parcel saving.
              </span>
            </p>
          </section>

          <section className="hud-panel p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                <Leaf className="h-4 w-4" />
              </span>
              <p className="text-sm font-bold text-emerald-50">
                What this means
              </p>
            </div>
            <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-emerald-100/50">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                Walking, cycling and e-bikes emit zero tailpipe CO₂e for the
                whole 1–20 km range.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                Public transit is {formatEmissions(EMISSION_FACTORS.car - EMISSION_FACTORS.train)}
                {' '}lower per passenger-km than an average petrol car.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                Delivery is a flat 118 g per parcel because one van carries many
                orders — distance alone does not tell the whole story.
              </li>
            </ul>
          </section>
        </div>
      </div>

      <p className="px-1 text-[10px] leading-relaxed text-emerald-100/25">
        Factors: UK DESNZ GHG conversion factors (2025/2026), EEA average EU
        grid intensity for EVs, and a consolidated last-mile parcel baseline
        (Scientific American / MIT). Estimates, not certified measurements.
      </p>
    </div>
  );
}

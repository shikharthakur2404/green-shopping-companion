import { useState } from 'react';
import type { RouteOption, Store, TransportModeId } from '../types';
import { cn } from '../lib/utils';
import {
  formatDuration,
  formatEmissions,
} from '../services/emissionService';

interface TripReceiptProps {
  store: Store;
  options: RouteOption[];
  activeMode: TransportModeId | null;
  onSelectMode: (mode: TransportModeId) => void;
  onLogTrip?: () => void;
  hasLogged?: boolean;
  className?: string;
}

export function TripReceipt({
  store,
  options,
  activeMode,
  onSelectMode,
  onLogTrip,
  hasLogged,
  className,
}: TripReceiptProps) {
  const [showPlot, setShowPlot] = useState(false);

  const carOption = options.find((opt) => opt.mode === 'car');
  const selectedOption =
    options.find((opt) => opt.mode === activeMode) ??
    options.find((opt) => opt.isGreenest) ??
    options[0];

  const savingsVsCar =
    carOption && selectedOption && selectedOption.mode !== 'car'
      ? carOption.emissionsGrams - selectedOption.emissionsGrams
      : 0;

  // Chart dimensions for Time vs Carbon plot
  const maxMinutes = Math.max(
    ...options.filter((o) => !o.isDelivery).map((o) => o.durationMinutes),
    45,
  );
  const maxGrams = Math.max(
    ...options.map((o) => o.emissionsGrams),
    carOption ? carOption.emissionsGrams : 500,
  );

  const plotWidth = 320;
  const plotHeight = 160;
  const padLeft = 42;
  const padBottom = 26;
  const padTop = 14;
  const padRight = 18;

  const chartW = plotWidth - padLeft - padRight;
  const chartH = plotHeight - padTop - padBottom;

  return (
    <div className={cn('receipt-sheet rounded-t-sm p-4 text-ink font-sans', className)}>
      {/* Receipt Header */}
      <div className="border-b border-hairline pb-3 text-center">
        <p className="font-mono text-[9px] uppercase tracking-wider text-ink-muted">
          Trip Carbon Receipt
        </p>
        <h3 className="font-serif text-lg font-bold leading-tight mt-0.5">
          {store.name}
        </h3>
        <p className="text-xs text-ink-muted mt-0.5">
          {store.address} · <span className="font-mono">{store.distanceKm.toFixed(1)} km walking route</span>
        </p>
      </div>

      {/* Mode Lines */}
      <div className="py-2.5 divide-y divide-hairline/60">
        {options.map((opt) => {
          const isSelected = activeMode === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => onSelectMode(opt.mode)}
              className={cn(
                'w-full flex items-center justify-between py-1.5 px-2 text-left transition-colors rounded-sm',
                isSelected ? 'bg-highlighter/35 font-medium' : 'hover:bg-paper/60',
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    opt.isGreenest ? 'bg-forest' : opt.mode === 'car' ? 'bg-vermilion' : 'bg-ink/30',
                  )}
                />
                <span className="text-xs truncate">{opt.modeName}</span>
                {opt.isGreenest && (
                  <span className="text-[10px] font-mono font-medium text-forest">
                    (Lowest carbon)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                <span className="text-ink-muted">{formatDuration(opt.durationMinutes)}</span>
                <span
                  className={cn(
                    'w-18 text-right font-medium',
                    opt.isGreenest ? 'text-forest font-semibold' : opt.mode === 'car' ? 'text-vermilion font-semibold' : 'text-ink',
                  )}
                >
                  {formatEmissions(opt.emissionsGrams)} CO₂e
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Receipt Footer Total Line */}
      <div className="border-t-2 border-ink pt-2.5 mt-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-serif font-bold">
            Selected: {selectedOption?.modeName}
          </span>
          <span className="font-mono text-sm font-bold text-forest">
            {formatEmissions(selectedOption?.emissionsGrams || 0)} CO₂e
          </span>
        </div>

        {savingsVsCar > 0 && (
          <div className="flex items-baseline justify-between text-[11px] font-mono text-forest mt-0.5">
            <span>vs. solo car:</span>
            <span>−{formatEmissions(savingsVsCar)} CO₂e</span>
          </div>
        )}
      </div>

      {/* Action Row: Plot Toggle & Log Trip */}
      <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowPlot(!showPlot)}
          className="text-[11px] underline text-ink-muted hover:text-ink cursor-pointer"
        >
          {showPlot ? 'Hide time-vs-carbon plot' : 'View time-vs-carbon plot'}
        </button>

        {onLogTrip && (
          <button
            type="button"
            onClick={onLogTrip}
            disabled={hasLogged}
            className={cn(
              'px-2.5 py-1 text-xs font-mono font-medium border border-ink rounded-sm transition-colors',
              hasLogged
                ? 'bg-forest text-surface border-forest'
                : 'bg-surface text-ink hover:bg-paper',
            )}
          >
            {hasLogged ? 'Trip logged' : 'Log this trip'}
          </button>
        )}
      </div>

      {/* Signature Time-vs-Carbon SVG Plot */}
      {showPlot && (
        <div className="mt-3 p-2 bg-paper/60 border border-hairline rounded-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">
              Time vs. Carbon (Lower-left wins)
            </span>
            <span className="text-[9px] text-ink-muted font-mono">
              x: min · y: g CO₂e
            </span>
          </div>

          <svg
            viewBox={`0 0 ${plotWidth} ${plotHeight}`}
            className="w-full h-auto text-ink overflow-visible"
            role="img"
            aria-label="Scatter plot of duration versus carbon emissions per transport mode"
          >
            {/* Grid & Axes */}
            <line
              x1={padLeft}
              y1={padTop}
              x2={padLeft}
              y2={plotHeight - padBottom}
              stroke="rgba(23, 33, 28, 0.2)"
              strokeWidth="1"
            />
            <line
              x1={padLeft}
              y1={plotHeight - padBottom}
              x2={plotWidth - padRight}
              y2={plotHeight - padBottom}
              stroke="rgba(23, 33, 28, 0.2)"
              strokeWidth="1"
            />

            {/* Zero lines */}
            <text
              x={padLeft - 4}
              y={plotHeight - padBottom + 3}
              textAnchor="end"
              className="text-[8px] font-mono fill-ink-muted"
            >
              0
            </text>
            <text
              x={padLeft - 4}
              y={padTop + 6}
              textAnchor="end"
              className="text-[8px] font-mono fill-ink-muted"
            >
              {Math.round(maxGrams)}g
            </text>
            <text
              x={plotWidth - padRight}
              y={plotHeight - padBottom + 12}
              textAnchor="end"
              className="text-[8px] font-mono fill-ink-muted"
            >
              {Math.round(maxMinutes)}m
            </text>

            {/* Plot Points */}
            {options
              .filter((opt) => !opt.isDelivery)
              .map((opt) => {
                const cx = padLeft + (opt.durationMinutes / maxMinutes) * chartW;
                const cy =
                  plotHeight -
                  padBottom -
                  (opt.emissionsGrams / (maxGrams || 1)) * chartH;
                const isSelected = activeMode === opt.mode;

                return (
                  <g
                    key={opt.mode}
                    className="cursor-pointer"
                    onClick={() => onSelectMode(opt.mode)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5.5 : 4}
                      fill={opt.isGreenest ? '#1E4D3B' : opt.mode === 'car' ? '#D8452A' : '#17211C'}
                      stroke={isSelected ? '#F6E05E' : '#FBF9F3'}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={cx + 6}
                      y={cy + 3}
                      className={cn(
                        'text-[8px] font-mono',
                        isSelected ? 'fill-ink font-bold' : 'fill-ink-muted',
                      )}
                    >
                      {opt.shortName}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>
      )}

      {/* Perforated bottom edge */}
      <div className="receipt-teeth" />
      <div className="receipt-teeth-border" />
    </div>
  );
}

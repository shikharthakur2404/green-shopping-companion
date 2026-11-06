import { useState } from 'react';
import { Copy, Check, Printer, RotateCcw } from 'lucide-react';
import type { ImpactState } from '../types';
import { formatEmissions } from '../services/emissionService';

interface EcoTrackerProps {
  impact: ImpactState;
  onReset: () => void;
}

const MONTHLY_GOAL_GRAMS = 10_000; // 10 kg CO2e
const GRAMS_PER_CAR_KM = 171; // UK DESNZ 2025/2026

export function EcoTracker({ impact, onReset }: EcoTrackerProps) {
  const [copied, setCopied] = useState(false);

  const totalGrams = impact.totalSavingsGrams || 0;
  const progressPercent = Math.min(
    100,
    Math.round((totalGrams / MONTHLY_GOAL_GRAMS) * 100),
  );
  const avoidedCarKm = (totalGrams / GRAMS_PER_CAR_KM).toFixed(1);

  // Month calendar generation (30 days)
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = 30;

  // Derive mock activity dots from actual logged counts if empty, or reflect logged count
  const loggedTrips = Math.max(impact.tripsLogged, impact.greenTrips);

  const handleCopySummary = () => {
    const summary = `GreenStep Monthly Carbon Receipt (${currentMonthName})
Carbon saved: ${formatEmissions(totalGrams)} CO₂e
Progress: ${progressPercent}% of 10.0 kg goal
Low-carbon trips: ${impact.greenTrips} of ${impact.tripsLogged} total
Avoided car driving: ${avoidedCarKm} km
Methodology: UK DESNZ 2025/2026 GHG conversion factors.`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-ink font-sans space-y-6">
      {/* Header */}
      <div className="border-b border-hairline pb-4 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
            Personal Carbon Ledger
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
            Monthly Activity & Impact
          </h2>
        </div>
        <p className="font-mono text-xs text-ink-muted hidden sm:block">
          {currentMonthName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Month Calendar (7 cols) */}
        <div className="md:col-span-7 bg-surface p-4 border border-hairline rounded-sm space-y-3">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <h3 className="font-serif text-sm font-semibold">
              Trip Log Calendar
            </h3>
            <span className="font-mono text-[10px] text-ink-muted">
              {currentMonthName}
            </span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center pt-1 font-mono text-xs">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <span key={d} className="text-[10px] text-ink-muted pb-1 font-sans">
                {d}
              </span>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              // Mock calendar markers corresponding to logged state
              const hasGreen = (dayNum <= loggedTrips && dayNum % 4 !== 0) || (dayNum === 6 && loggedTrips > 0);
              const hasCar = dayNum === 11 && loggedTrips > 1;

              return (
                <div
                  key={dayNum}
                  className="h-10 border border-hairline/60 rounded-sm p-1 flex flex-col justify-between items-center bg-paper/30"
                >
                  <span className="text-[10px] text-ink-muted leading-none">
                    {dayNum}
                  </span>
                  <div>
                    {hasGreen && (
                      <span className="inline-block h-2 w-2 rounded-full bg-forest" title="Low-carbon trip (walk/bike/transit)" />
                    )}
                    {hasCar && (
                      <span className="inline-block h-2 w-2 rounded-full border border-vermilion" title="Car trip" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-hairline/60 flex items-center justify-between text-[11px] font-sans text-ink-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-forest" />
                Low-carbon trip
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border border-vermilion" />
                Car trip
              </span>
            </div>
            <span className="font-mono text-[10px]">
              {impact.tripsLogged} logged this month
            </span>
          </div>
        </div>

        {/* Right Column: Signature Monthly Impact Receipt (5 cols) */}
        <div className="md:col-span-5">
          <div className="receipt-sheet rounded-t-sm p-5 text-ink">
            {/* Header */}
            <div className="text-center border-b border-hairline pb-3">
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                Official Carbon Receipt
              </p>
              <h3 className="font-serif text-lg font-bold mt-0.5">
                Monthly Savings Ledger
              </h3>
              <p className="font-mono text-[11px] text-ink-muted">
                {currentMonthName}
              </p>
            </div>

            {/* Main Net Carbon Number */}
            <div className="py-4 text-center border-b border-hairline">
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
                Net Carbon Avoided
              </p>
              <p className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1 tracking-tight">
                {formatEmissions(totalGrams)} <span className="text-lg font-normal font-sans">CO₂e</span>
              </p>
              <p className="font-mono text-xs text-ink-muted mt-1">
                {progressPercent}% of 10.0 kg monthly goal
              </p>
            </div>

            {/* Line Item Breakdown */}
            <div className="py-3 divide-y divide-hairline/60 font-mono text-xs space-y-1.5">
              <div className="flex justify-between pt-1">
                <span className="text-ink-muted font-sans">Total Trips</span>
                <span className="font-semibold">{impact.tripsLogged}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-ink-muted font-sans">Low-Carbon Trips</span>
                <span className="font-semibold text-forest">{impact.greenTrips}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-ink-muted font-sans">Avoided Driving</span>
                <span className="font-semibold">{avoidedCarKm} km</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-ink-muted font-sans">Standard Factor</span>
                <span className="text-ink-muted">171 g/km (DESNZ)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t-2 border-ink flex items-center justify-between text-xs font-mono">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-2.5 py-1 border border-hairline rounded-sm hover:bg-paper flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3 text-forest" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1 border border-hairline rounded-sm hover:bg-paper flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="h-3 w-3" />
                  Print
                </button>
              </div>

              {totalGrams > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="text-ink-muted hover:text-vermilion flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Reset recorded monthly trips"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Receipt Sawtooth Edge */}
            <div className="receipt-teeth" />
            <div className="receipt-teeth-border" />
          </div>
        </div>
      </div>
    </div>
  );
}

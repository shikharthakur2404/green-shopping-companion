import { Leaf, RotateCcw, Sparkles, TrendingDown } from 'lucide-react';
import type { ImpactState } from '../types';
import { clamp } from '../lib/utils';

interface ImpactSummaryProps {
  impact: ImpactState;
  onReset: () => void;
}

const MONTHLY_GOAL_GRAMS = 10_000;
const GRAMS_PER_CAR_KM = 170;
const GRAMS_PER_PHONE_CHARGE = 8.22;

function motivationalLine(grams: number): string {
  if (grams <= 0) return 'Log your first trip to start banking carbon savings.';
  if (grams < 500) return 'First grams banked — small trips really do add up.';
  if (grams < 2500) return 'You are building a low-carbon shopping habit.';
  if (grams < 6000) return 'Solid progress. You are choosing lighter trips.';
  if (grams < 10_000) return 'Over halfway to a 10 kg monthly saving. Keep going.';
  return 'Past a 10 kg saving — that is a genuinely strong month.';
}

export function ImpactSummary({ impact, onReset }: ImpactSummaryProps) {
  const { totalSavingsGrams, tripsLogged, greenTrips } = impact;
  const totalKg = totalSavingsGrams / 1000;
  const progress = clamp((totalSavingsGrams / MONTHLY_GOAL_GRAMS) * 100, 0, 100);
  const carKmAvoided = Math.round(totalSavingsGrams / GRAMS_PER_CAR_KM);
  const phoneCharges = Math.round(totalSavingsGrams / GRAMS_PER_PHONE_CHARGE);
  const greenShare =
    tripsLogged > 0 ? Math.round((greenTrips / tripsLogged) * 100) : 0;

  return (
    <section className="hud-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="hud-eyebrow">Your impact</p>
          <h2 className="mt-1 flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-emerald-50">
            <Leaf className="h-4 w-4 text-emerald-400" />
            Carbon saved
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset your saved impact and start again?')) {
              onReset();
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-emerald-100/30 transition hover:border-white/15 hover:text-emerald-100/70"
          aria-label="Reset impact tracker"
          title="Reset impact tracker"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-semibold leading-none text-emerald-300">
            {totalKg < 0.01 ? '0' : totalKg.toFixed(2)}
            <span className="ml-1 text-base font-medium text-emerald-100/45">
              kg
            </span>
          </p>
          <p className="mt-1 text-[11px] text-emerald-100/40">
            CO₂e saved vs solo car trips
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
          {greenShare}% green
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-emerald-100/40">
          <span>Monthly goal</span>
          <span>{progress.toFixed(0)}% of 10 kg</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-emerald-100/50">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
          {motivationalLine(totalSavingsGrams)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <p className="font-display text-base font-semibold text-emerald-100/85">
            {tripsLogged}
          </p>
          <p className="text-[9px] uppercase tracking-wide text-emerald-100/35">
            Trips logged
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <p className="font-display text-base font-semibold text-emerald-100/85">
            {carKmAvoided}
          </p>
          <p className="text-[9px] uppercase tracking-wide text-emerald-100/35">
            Car km avoided
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <p className="font-display text-base font-semibold text-emerald-100/85">
            {phoneCharges}
          </p>
          <p className="text-[9px] uppercase tracking-wide text-emerald-100/35">
            Phone charges
          </p>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-100/25">
        <TrendingDown className="h-3 w-3" />
        Stored only in this browser. No account, no tracking.
      </p>
    </section>
  );
}

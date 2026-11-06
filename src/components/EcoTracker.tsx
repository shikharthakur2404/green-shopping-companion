import { useState } from 'react';
import {
  Award,
  Check,
  Copy,
  Flame,
  GraduationCap,
  Leaf,
  MapPin,
  Printer,
  RotateCcw,
  Share2,
  ShoppingBag,
  Sprout,
  TreePine,
  TrendingDown,
  Trophy,
} from 'lucide-react';
import type { ImpactState } from '../types';
import { clamp } from '../lib/utils';
import { formatEmissions } from '../services/emissionService';

interface EcoTrackerProps {
  impact: ImpactState;
  onReset: () => void;
}

const MONTHLY_GOAL_GRAMS = 10_000;
const GRAMS_PER_CAR_KM = 171;
const GRAMS_PER_TREE_YEAR = 21_000;

function motivationalLine(grams: number): string {
  if (grams <= 0) return 'Log your first trip in Find & Compare to start your streak.';
  if (grams < 500) return 'First grams banked — small trips really do add up.';
  if (grams < 2500) return 'You are building a low-carbon shopping habit.';
  if (grams < 6000) return 'Solid progress. You are choosing lighter trips.';
  if (grams < 10_000) return 'Over halfway to a 10 kg monthly saving. Keep going.';
  return 'Past a 10 kg saving — that is a genuinely strong month.';
}

export function EcoTracker({ impact, onReset }: EcoTrackerProps) {
  const [copied, setCopied] = useState(false);
  const { totalSavingsGrams, tripsLogged, greenTrips, currentStreak } = impact;
  const totalKg = totalSavingsGrams / 1000;
  const progress = clamp((totalSavingsGrams / MONTHLY_GOAL_GRAMS) * 100, 0, 100);
  const carKmAvoided = Math.round(totalSavingsGrams / GRAMS_PER_CAR_KM);
  const trees = totalSavingsGrams / GRAMS_PER_TREE_YEAR;
  const greenShare =
    tripsLogged > 0 ? Math.round((greenTrips / tripsLogged) * 100) : 0;
  const displayKg = totalKg < 0.01 ? '0' : totalKg.toFixed(2);
  const displayTrees = trees < 0.1 ? '0' : trees.toFixed(1);
  const monthLabel = new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  async function handleShare() {
    const text = `GreenStep · ${displayKg} kg CO₂e saved across ${tripsLogged} logged shopping trips — about ${displayTrees} trees for a year. Campus pilot: FAU Nuremberg / Bucharest.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My GreenStep savings', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.14] via-white/[0.03] to-transparent p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-lime-300/15 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="hud-eyebrow">My eco tracker</p>
              <span className="pill border-amber-300/25 bg-amber-300/10 text-amber-200">
                <GraduationCap className="h-3 w-3" />
                Campus pilot
              </span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-emerald-50 sm:text-4xl">
              Your habits, made visible.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-100/55">
              Every time you log a trip, GreenStep banks the difference against
              a solo petrol car. Savings stay in this browser.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-carbon-950/45 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-emerald-100/35">
                Campus pilot
              </p>
              <p className="text-xs font-bold text-emerald-100/85">
                FAU Nuremberg · Bucharest
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-100/35">
                <MapPin className="h-2.5 w-2.5" />
                Student workshop edition
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="hud-panel p-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <Leaf className="h-4 w-4" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-100/40">
              Saved this month
            </span>
          </div>
          <p className="data-value mt-3 text-3xl font-semibold text-emerald-300">
            {displayKg}
            <span className="ml-1 text-sm font-normal text-emerald-100/40">kg</span>
          </p>
          <p className="mt-1 text-[10px] text-emerald-100/35">CO₂e vs solo car</p>
        </div>

        <div className="hud-panel p-4">
          <div className="flex items-center gap-2 text-amber-300">
            <Flame className="h-4 w-4" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-100/40">
              Green streak
            </span>
          </div>
          <p className="data-value mt-3 text-3xl font-semibold text-amber-200">
            {currentStreak}
            <span className="ml-1 text-sm font-normal text-emerald-100/40">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </p>
          <p className="mt-1 text-[10px] text-emerald-100/35">
            {greenShare}% of trips were green
          </p>
        </div>

        <div className="hud-panel p-4">
          <div className="flex items-center gap-2 text-lime-300">
            <TreePine className="h-4 w-4" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-100/40">
              Trees equivalent
            </span>
          </div>
          <p className="data-value mt-3 text-3xl font-semibold text-lime-200">
            {displayTrees}
            <span className="ml-1 text-sm font-normal text-emerald-100/40">
              trees
            </span>
          </p>
          <p className="mt-1 text-[10px] text-emerald-100/35">
            One year of absorption
          </p>
        </div>

        <div className="hud-panel p-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <TrendingDown className="h-4 w-4" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-100/40">
              Car km avoided
            </span>
          </div>
          <p className="data-value mt-3 text-3xl font-semibold text-cyan-200">
            {carKmAvoided}
            <span className="ml-1 text-sm font-normal text-emerald-100/40">km</span>
          </p>
          <p className="mt-1 text-[10px] text-emerald-100/35">
            {tripsLogged} trips logged
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="hud-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="hud-eyebrow">Monthly goal</p>
              <h3 className="mt-1 font-display text-lg font-bold text-emerald-50">
                {progress.toFixed(0)}% of 10 kg
              </h3>
            </div>
            <span className="pill border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
              <Award className="h-3 w-3" />
              {progress >= 100 ? 'Goal reached' : 'In progress'}
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-300 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-emerald-100/55">
            <Sprout className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            {motivationalLine(totalSavingsGrams)}
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[9px] uppercase tracking-[0.14em] text-emerald-100/35">
                Trips
              </p>
              <p className="data-value mt-1 text-lg font-semibold text-emerald-100/85">
                {tripsLogged}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[9px] uppercase tracking-[0.14em] text-emerald-100/35">
                Green trips
              </p>
              <p className="data-value mt-1 text-lg font-semibold text-emerald-100/85">
                {greenTrips}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-[9px] uppercase tracking-[0.14em] text-emerald-100/35">
                Last trip
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-100/70">
                {impact.lastLoggedAt
                  ? new Date(impact.lastLoggedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Not yet'}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-400/15"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / save PDF
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="no-print inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400 px-3.5 py-2 text-xs font-bold text-carbon-950 transition hover:bg-emerald-300 hover:shadow-glow"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  Share card
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset your saved impact and start again?')) {
                  onReset();
                }
              }}
              className="no-print inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-emerald-100/45 transition hover:border-white/20 hover:text-emerald-100/75"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-100/25">
            <Copy className="h-3 w-3" />
            Sharing copies a text summary unless your device supports native
            share. No account, no tracking.
          </p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="hud-eyebrow">Shareable savings card</p>
            <span className="text-[10px] text-emerald-100/30">{monthLabel}</span>
          </div>
          <div className="print-card relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-carbon-900 to-carbon-950 p-6 shadow-panel">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-lime-300/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-emerald-600 shadow-glow">
                  <Leaf className="h-5 w-5 text-carbon-950" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold leading-none text-emerald-50">
                    GreenStep
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-emerald-200/50">
                    Carbon savings card
                  </p>
                </div>
              </div>
              <span className="pill border-emerald-300/30 bg-emerald-300/10 text-emerald-100/80">
                <Check className="h-3 w-3" />
                Verified
              </span>
            </div>

            <div className="relative mt-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/55">
                CO₂e saved
              </p>
              <p className="data-value mt-1 text-6xl font-semibold leading-none text-emerald-200">
                {displayKg}
                <span className="ml-2 font-sans text-xl font-semibold text-emerald-100/45">
                  kg
                </span>
              </p>
              <p className="mt-2 text-[11px] text-emerald-100/45">
                versus driving the same shopping trips alone
              </p>
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-carbon-950/35 p-2.5">
                <p className="text-[8px] uppercase tracking-wide text-emerald-100/35">
                  Trips
                </p>
                <p className="data-value mt-1 text-sm font-semibold text-emerald-100/85">
                  {tripsLogged}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-carbon-950/35 p-2.5">
                <p className="text-[8px] uppercase tracking-wide text-emerald-100/35">
                  Streak
                </p>
                <p className="data-value mt-1 text-sm font-semibold text-emerald-100/85">
                  {currentStreak} d
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-carbon-950/35 p-2.5">
                <p className="text-[8px] uppercase tracking-wide text-emerald-100/35">
                  Trees
                </p>
                <p className="data-value mt-1 text-sm font-semibold text-emerald-100/85">
                  {displayTrees}
                </p>
              </div>
            </div>

            <div className="relative mt-6 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
              <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-emerald-200/45">
                <ShoppingBag className="h-3 w-3" />
                Shop close · travel smart
              </p>
              <p className="text-[9px] font-semibold text-emerald-200/55">
                FAU Nürnberg · Bucharest
              </p>
            </div>
          </div>

          <p className="mt-2 px-1 text-[10px] leading-relaxed text-emerald-100/25">
            Trees use a 21 kg CO₂ per mature tree per year absorption estimate.
            Savings are {formatEmissions(totalSavingsGrams)} CO₂e in total.
          </p>
        </section>
      </div>
    </div>
  );
}

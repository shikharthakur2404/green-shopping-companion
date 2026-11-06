import { useMemo, useState } from 'react';
import { EMISSION_FACTORS } from '../services/emissionService';

export function CarbonCalculator() {
  const [distanceKm, setDistanceKm] = useState<number>(3.0);

  // Delivery baseline is flat 118 g CO2e per parcel
  const deliveryGrams = EMISSION_FACTORS.delivery;

  // Compute emissions at current round-trip distance
  const currentEmissions = useMemo(() => {
    return {
      walk: 0,
      bike: 0,
      tram: Math.round(EMISSION_FACTORS.train * distanceKm),
      bus: Math.round(EMISSION_FACTORS.bus * distanceKm),
      ev: Math.round(EMISSION_FACTORS.ev * distanceKm),
      car: Math.round(EMISSION_FACTORS.car * distanceKm),
      delivery: deliveryGrams,
    };
  }, [distanceKm, deliveryGrams]);

  // Compute break-even crossover distance with online delivery (118 g)
  const breakEvens = useMemo(() => {
    return {
      car: Number((deliveryGrams / EMISSION_FACTORS.car).toFixed(2)), // ~0.69 km
      bus: Number((deliveryGrams / EMISSION_FACTORS.bus).toFixed(2)), // ~1.33 km
      ev: Number((deliveryGrams / EMISSION_FACTORS.ev).toFixed(2)),   // ~2.62 km
      tram: Number((deliveryGrams / EMISSION_FACTORS.train).toFixed(2)), // ~4.07 km
    };
  }, [deliveryGrams]);

  // Dynamic editorial headline
  const headline = useMemo(() => {
    if (distanceKm <= 0.69) {
      return `At ${distanceKm.toFixed(1)} km round trip, every local option beats online delivery.`;
    }
    if (distanceKm <= 1.33) {
      return `At ${distanceKm.toFixed(1)} km round trip, walking, biking, transit, and EV beat delivery; driving a petrol car emits more than the courier.`;
    }
    if (distanceKm <= 4.07) {
      return `At ${distanceKm.toFixed(1)} km round trip, the tram and EV still beat delivery; the petrol car and bus don't.`;
    }
    return `At ${distanceKm.toFixed(1)} km round trip, consolidated delivery beats driving and bus travel; walking and cycling remain zero.`;
  }, [distanceKm]);

  // Chart plotting math (SVG)
  const maxDistance = 12; // 0 to 12 km x-axis
  const maxGrams = 1400; // y-axis up to 1400 g CO2e
  const width = 580;
  const height = 280;
  const padLeft = 52;
  const padBottom = 34;
  const padTop = 20;
  const padRight = 24;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const toX = (km: number) => padLeft + (Math.min(km, maxDistance) / maxDistance) * chartW;
  const toY = (g: number) => padTop + chartH - (Math.min(g, maxGrams) / maxGrams) * chartH;

  const deliveryY = toY(deliveryGrams);
  const cursorX = toX(distanceKm);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-ink font-sans space-y-6">
      {/* Title & Live Sentence */}
      <div className="border-b border-hairline pb-4">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          Break-Even Carbon Analysis
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1 leading-tight">
          When does delivery beat going to the store?
        </h2>
        <p className="font-serif text-base sm:text-lg text-forest font-semibold mt-2 leading-snug">
          {headline}
        </p>
      </div>

      {/* Interactive Distance Slider */}
      <div className="bg-surface p-4 border border-hairline rounded-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="break-even-slider" className="font-medium text-ink">
            Round-trip shopping distance
          </label>
          <span className="font-mono text-base font-bold text-ink">
            {distanceKm.toFixed(1)} km
          </span>
        </div>
        <input
          id="break-even-slider"
          type="range"
          min={0.5}
          max={12}
          step={0.1}
          value={distanceKm}
          onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
          className="paper-slider"
        />
        <div className="flex justify-between text-[10px] font-mono text-ink-muted">
          <span>0.5 km (neighborhood shop)</span>
          <span>5 km (cross-town retail)</span>
          <span>12 km (suburban center)</span>
        </div>
      </div>

      {/* SVG Break-Even Chart */}
      <div className="bg-surface p-4 border border-hairline rounded-sm overflow-x-auto">
        <div className="min-w-[500px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto text-ink overflow-visible"
            role="img"
            aria-label="Break-even chart comparing transport mode emissions with online delivery"
          >
            {/* Grid Rules */}
            {[200, 400, 600, 800, 1000, 1200].map((g) => (
              <line
                key={g}
                x1={padLeft}
                y1={toY(g)}
                x2={width - padRight}
                y2={toY(g)}
                stroke="rgba(23, 33, 28, 0.08)"
                strokeWidth="1"
              />
            ))}

            {/* Axes */}
            <line
              x1={padLeft}
              y1={padTop}
              x2={padLeft}
              y2={height - padBottom}
              stroke="rgba(23, 33, 28, 0.25)"
              strokeWidth="1"
            />
            <line
              x1={padLeft}
              y1={height - padBottom}
              x2={width - padRight}
              y2={height - padBottom}
              stroke="rgba(23, 33, 28, 0.25)"
              strokeWidth="1"
            />

            {/* Y-axis Ticks */}
            {[0, 200, 600, 1000, 1400].map((g) => (
              <text
                key={g}
                x={padLeft - 6}
                y={toY(g) + 3}
                textAnchor="end"
                className="text-[9px] font-mono fill-ink-muted"
              >
                {g}g
              </text>
            ))}

            {/* X-axis Ticks */}
            {[0, 2, 4, 6, 8, 10, 12].map((km) => (
              <text
                key={km}
                x={toX(km)}
                y={height - padBottom + 16}
                textAnchor="middle"
                className="text-[9px] font-mono fill-ink-muted"
              >
                {km} km
              </text>
            ))}

            {/* Flat Delivery Baseline (118 g) */}
            <line
              x1={padLeft}
              y1={deliveryY}
              x2={width - padRight}
              y2={deliveryY}
              stroke="#5E6A63"
              strokeWidth="1.5"
              strokeDasharray="4, 3"
            />
            <text
              x={width - padRight}
              y={deliveryY - 5}
              textAnchor="end"
              className="text-[10px] font-mono font-medium fill-ink-muted"
            >
              Consolidated delivery (118 g CO₂e)
            </text>

            {/* Petrol Car Line (171 g/km) */}
            <line
              x1={toX(0)}
              y1={toY(0)}
              x2={toX(maxDistance)}
              y2={toY(171 * maxDistance)}
              stroke="#D8452A"
              strokeWidth="2"
            />
            <text
              x={toX(7.2)}
              y={toY(171 * 7.2) - 6}
              className="text-[9px] font-mono font-bold fill-vermilion"
            >
              Petrol car (171 g/km)
            </text>

            {/* City Bus Line (89 g/km) */}
            <line
              x1={toX(0)}
              y1={toY(0)}
              x2={toX(maxDistance)}
              y2={toY(89 * maxDistance)}
              stroke="#17211C"
              strokeWidth="1.5"
            />

            {/* EV Line (45 g/km) */}
            <line
              x1={toX(0)}
              y1={toY(0)}
              x2={toX(maxDistance)}
              y2={toY(45 * maxDistance)}
              stroke="#5E6A63"
              strokeWidth="1.5"
            />

            {/* Tram Line (29 g/km) */}
            <line
              x1={toX(0)}
              y1={toY(0)}
              x2={toX(maxDistance)}
              y2={toY(29 * maxDistance)}
              stroke="#1E4D3B"
              strokeWidth="1.5"
            />

            {/* Walk / Bike Line (0 g/km) */}
            <line
              x1={toX(0)}
              y1={toY(0)}
              x2={toX(maxDistance)}
              y2={toY(0)}
              stroke="#1E4D3B"
              strokeWidth="2.5"
            />
            <text
              x={toX(9)}
              y={toY(0) - 5}
              className="text-[9px] font-mono font-bold fill-forest"
            >
              Walk & Bike (0 g)
            </text>

            {/* Crossover Annotations */}
            <circle cx={toX(breakEvens.car)} cy={deliveryY} r={3.5} fill="#D8452A" />
            <text
              x={toX(breakEvens.car) + 4}
              y={deliveryY + 12}
              className="text-[8px] font-mono fill-vermilion font-medium"
            >
              Car crosses: 0.7 km
            </text>

            <circle cx={toX(breakEvens.bus)} cy={deliveryY} r={3} fill="#17211C" />
            <text
              x={toX(breakEvens.bus) + 4}
              y={deliveryY + 22}
              className="text-[8px] font-mono fill-ink font-medium"
            >
              Bus crosses: 1.3 km
            </text>

            <circle cx={toX(breakEvens.tram)} cy={deliveryY} r={3} fill="#1E4D3B" />
            <text
              x={toX(breakEvens.tram) + 4}
              y={deliveryY - 8}
              className="text-[8px] font-mono fill-forest font-medium"
            >
              Tram crosses: 4.1 km
            </text>

            {/* Vertical Distance Cursor */}
            <line
              x1={cursorX}
              y1={padTop}
              x2={cursorX}
              y2={height - padBottom}
              stroke="#17211C"
              strokeWidth="1.5"
              strokeDasharray="2, 2"
            />
            <circle cx={cursorX} cy={toY(currentEmissions.car)} r={4} fill="#D8452A" />
            <circle cx={cursorX} cy={toY(currentEmissions.tram)} r={4} fill="#1E4D3B" />
          </svg>
        </div>
      </div>

      {/* Numerical Data Table */}
      <div className="border border-hairline rounded-sm overflow-hidden bg-surface">
        <table className="w-full text-left text-xs divide-y divide-hairline">
          <thead className="bg-paper/70 font-mono text-[10px] text-ink-muted uppercase tracking-wider">
            <tr>
              <th className="p-2.5">Mode</th>
              <th className="p-2.5">Per-KM Factor</th>
              <th className="p-2.5 text-right">At {distanceKm.toFixed(1)} km</th>
              <th className="p-2.5 text-right">Status vs. Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline/60 font-mono text-xs">
            <tr>
              <td className="p-2.5 font-sans font-medium text-forest">Walking / Cycling</td>
              <td className="p-2.5 text-ink-muted">0 g CO₂e/km</td>
              <td className="p-2.5 text-right font-bold text-forest">0 g CO₂e</td>
              <td className="p-2.5 text-right text-forest">Beats delivery (saves 118 g)</td>
            </tr>
            <tr>
              <td className="p-2.5 font-sans font-medium text-forest">Tram / Light Rail</td>
              <td className="p-2.5 text-ink-muted">29 g CO₂e/km</td>
              <td className="p-2.5 text-right text-ink">{currentEmissions.tram} g CO₂e</td>
              <td className="p-2.5 text-right">
                {currentEmissions.tram < deliveryGrams ? (
                  <span className="text-forest">Beats delivery (−{deliveryGrams - currentEmissions.tram} g)</span>
                ) : (
                  <span className="text-ink-muted">Delivery wins (+{currentEmissions.tram - deliveryGrams} g)</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="p-2.5 font-sans font-medium">Electric Car (EV)</td>
              <td className="p-2.5 text-ink-muted">45 g CO₂e/km</td>
              <td className="p-2.5 text-right text-ink">{currentEmissions.ev} g CO₂e</td>
              <td className="p-2.5 text-right">
                {currentEmissions.ev < deliveryGrams ? (
                  <span className="text-forest">Beats delivery (−{deliveryGrams - currentEmissions.ev} g)</span>
                ) : (
                  <span className="text-ink-muted">Delivery wins (+{currentEmissions.ev - deliveryGrams} g)</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="p-2.5 font-sans font-medium">City Bus</td>
              <td className="p-2.5 text-ink-muted">89 g CO₂e/km</td>
              <td className="p-2.5 text-right text-ink">{currentEmissions.bus} g CO₂e</td>
              <td className="p-2.5 text-right">
                {currentEmissions.bus < deliveryGrams ? (
                  <span className="text-forest">Beats delivery (−{deliveryGrams - currentEmissions.bus} g)</span>
                ) : (
                  <span className="text-ink-muted">Delivery wins (+{currentEmissions.bus - deliveryGrams} g)</span>
                )}
              </td>
            </tr>
            <tr className="bg-vermilion/5">
              <td className="p-2.5 font-sans font-semibold text-vermilion">Petrol Car (1 Person)</td>
              <td className="p-2.5 text-ink-muted">171 g CO₂e/km</td>
              <td className="p-2.5 text-right font-bold text-vermilion">{currentEmissions.car} g CO₂e</td>
              <td className="p-2.5 text-right text-vermilion font-medium">
                {currentEmissions.car > deliveryGrams
                  ? `Delivery wins (+${currentEmissions.car - deliveryGrams} g excess)`
                  : 'Car marginally beats delivery'}
              </td>
            </tr>
            <tr className="bg-paper/40">
              <td className="p-2.5 font-sans font-medium text-ink-muted">Online Delivery (Consolidated)</td>
              <td className="p-2.5 text-ink-muted">118 g flat</td>
              <td className="p-2.5 text-right font-bold text-ink">118 g CO₂e</td>
              <td className="p-2.5 text-right text-ink-muted">Standard baseline</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

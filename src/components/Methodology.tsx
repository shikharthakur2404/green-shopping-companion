import { ExternalLink } from 'lucide-react';
import { EMISSION_FACTORS } from '../services/emissionService';

interface FactorRow {
  mode: string;
  factor: number;
  unit: string;
  detail: string;
  source: string;
}

const FACTORS: FactorRow[] = [
  {
    mode: 'Walking',
    factor: EMISSION_FACTORS.walking,
    unit: 'g CO₂e / passenger-km',
    detail: 'Zero tailpipe emissions. Active travel.',
    source: 'UK DESNZ',
  },
  {
    mode: 'Cycling',
    factor: EMISSION_FACTORS.cycling,
    unit: 'g CO₂e / passenger-km',
    detail: 'Zero tailpipe emissions. Active travel.',
    source: 'UK DESNZ',
  },
  {
    mode: 'E-Bike',
    factor: EMISSION_FACTORS.ebike,
    unit: 'g CO₂e / passenger-km',
    detail: 'Small electric battery assist (approx. 0 g direct tailpipe).',
    source: 'UK DESNZ',
  },
  {
    mode: 'Tram / Light Rail',
    factor: EMISSION_FACTORS.train,
    unit: 'g CO₂e / passenger-km',
    detail: 'National grid mix, average occupancy (2025/2026 dataset).',
    source: 'UK DESNZ / EEA',
  },
  {
    mode: 'City Bus',
    factor: EMISSION_FACTORS.bus,
    unit: 'g CO₂e / passenger-km',
    detail: 'Local bus, average occupancy, Euro 6 fleet mix.',
    source: 'UK DESNZ',
  },
  {
    mode: 'Electric Car (EV)',
    factor: EMISSION_FACTORS.ev,
    unit: 'g CO₂e / km',
    detail: 'Battery electric vehicle, average grid carbon intensity.',
    source: 'EEA / UK DESNZ',
  },
  {
    mode: 'Petrol Car',
    factor: EMISSION_FACTORS.car,
    unit: 'g CO₂e / km',
    detail: 'Average petrol vehicle, single occupant (solo driver).',
    source: 'UK DESNZ',
  },
  {
    mode: 'Online Delivery',
    factor: EMISSION_FACTORS.delivery,
    unit: 'g CO₂e / parcel',
    detail: 'Consolidated last-mile delivery route serving multiple recipients.',
    source: 'MIT / Scientific American',
  },
];

const SOURCES = [
  {
    title: 'UK Government GHG Conversion Factors for Company Reporting (2025/2026)',
    publisher: 'Department for Energy Security and Net Zero (DESNZ)',
    url: 'https://assets.publishing.service.gov.uk/media/6a2940543b15d05a7ce3202e/2026-GHG-conversion-factors-methodology-report.pdf',
    note: 'Primary authority for per-passenger-km transport emission factors across road and rail.',
  },
  {
    title: 'Greenhouse Gas Emission Intensity of Transport in the European Union',
    publisher: 'European Environment Agency (EEA)',
    url: 'https://www.eea.europa.eu/data-and-maps/indicators/transport-emissions-greenhouse-gases',
    note: 'European transit and fleet averages for urban bus, tram, and electric vehicle fleets.',
  },
  {
    title: 'Delivery from Local Store Is Greenest Shopping Method Most of the Time',
    publisher: 'Scientific American / MIT Center for Transportation & Logistics',
    url: 'https://www.scientificamerican.com/article/delivery-from-local-store-is-greenest-shopping-method-most-of-the-time1/',
    note: 'Empirical analysis comparing consolidated delivery van parcel drops against solo car shopping trips.',
  },
  {
    title: 'OpenStreetMap & Overpass API',
    publisher: 'OpenStreetMap Foundation',
    url: 'https://wiki.openstreetmap.org/wiki/Overpass_API',
    note: 'Open geodata and retail amenity classifications used to identify local physical storefronts.',
  },
];

export function Methodology() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-ink font-sans space-y-6">
      {/* Header */}
      <div className="border-b border-hairline pb-4">
        <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          Scientific Transparency
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-1">
          Methodology & Emission Factors
        </h2>
        <p className="text-sm text-ink-muted mt-1 leading-relaxed">
          GreenStep applies published government and academic conversion factors to routed distances. All calculations represent direct and indirect per-passenger greenhouse gas equivalencies (CO₂e).
        </p>
      </div>

      {/* Emission Factor Table */}
      <div className="bg-surface border border-hairline rounded-sm overflow-hidden">
        <div className="p-3.5 border-b border-hairline bg-paper/40">
          <h3 className="font-serif text-sm font-semibold">
            Conversion Factor Reference Table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-hairline">
            <thead className="bg-paper/70 font-mono text-[10px] text-ink-muted uppercase tracking-wider">
              <tr>
                <th className="p-2.5">Mode</th>
                <th className="p-2.5">Factor</th>
                <th className="p-2.5">Details</th>
                <th className="p-2.5">Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline/60 font-mono text-xs">
              {FACTORS.map((row) => (
                <tr key={row.mode}>
                  <td className="p-2.5 font-sans font-medium text-ink">{row.mode}</td>
                  <td className="p-2.5 font-bold text-forest">
                    {row.factor} <span className="text-[10px] font-normal text-ink-muted">{row.unit}</span>
                  </td>
                  <td className="p-2.5 font-sans text-ink-muted">{row.detail}</td>
                  <td className="p-2.5 text-[11px] text-ink-muted">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Core Logic Rules */}
      <div className="bg-surface p-4 border border-hairline rounded-sm space-y-3">
        <h3 className="font-serif text-sm font-semibold border-b border-hairline pb-2">
          Mathematical Formulation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans leading-relaxed text-ink-muted">
          <div>
            <p className="font-medium text-ink mb-1">In-Store Shopping Trips</p>
            <p className="font-mono text-[11px] text-ink mb-1">
              Emissions (g) = Distance (round-trip km) × Emission Factor
            </p>
            <p>
              Distance is computed via OpenStreetMap road network routing. Walking and cycling speeds are modeled at 5 km/h and 15 km/h respectively.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink mb-1">Online Delivery Baseline</p>
            <p className="font-mono text-[11px] text-ink mb-1">
              Emissions (g) = 118 g CO₂e flat per parcel
            </p>
            <p>
              Represents last-mile consolidated delivery where a single van drops 60–120 parcels along an optimized circular drop route, eliminating dedicated round trips.
            </p>
          </div>
        </div>
      </div>

      {/* Cited Sources */}
      <div className="bg-surface border border-hairline rounded-sm p-4 space-y-3">
        <h3 className="font-serif text-sm font-semibold border-b border-hairline pb-2">
          Primary Cited Sources
        </h3>
        <div className="divide-y divide-hairline/60">
          {SOURCES.map((src) => (
            <div key={src.title} className="py-2.5 first:pt-1 last:pb-1">
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-baseline justify-between gap-2 text-xs font-serif font-bold text-ink hover:text-forest underline"
              >
                <span>{src.title}</span>
                <ExternalLink className="h-3 w-3 shrink-0 text-ink-muted group-hover:text-forest" />
              </a>
              <p className="text-[11px] text-ink-muted font-sans mt-0.5">
                {src.publisher} — {src.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Pilot Line */}
      <div className="pt-2 text-center text-xs text-ink-muted border-t border-hairline">
        <p>Concept developed for carbon-reduction workshop in Bucharest, Romania · Pilot testing with FAU Nuremberg data.</p>
      </div>
    </div>
  );
}

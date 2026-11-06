import {
  BookOpen,
  ExternalLink,
  FileText,
  Info,
  Leaf,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import { EMISSION_FACTORS } from '../services/emissionService';

interface FactorRow {
  mode: string;
  factor: string;
  unit: string;
  detail: string;
  source: string;
  badge?: string;
}

const FACTOR_ROWS: FactorRow[] = [
  {
    mode: 'Walking',
    factor: '0',
    unit: 'g CO₂e / passenger-km',
    detail: 'Zero tailpipe emissions · active travel',
    source: 'UK DESNZ',
  },
  {
    mode: 'Cycling',
    factor: '0',
    unit: 'g CO₂e / passenger-km',
    detail: 'Zero tailpipe emissions · active travel',
    source: 'UK DESNZ',
  },
  {
    mode: 'E-Bike',
    factor: '0',
    unit: 'g CO₂e / passenger-km',
    detail: 'Zero tailpipe emissions · small electric assist',
    source: 'UK DESNZ',
  },
  {
    mode: 'Tram / light rail',
    factor: `${EMISSION_FACTORS.train}`,
    unit: 'g CO₂e / passenger-km',
    detail: 'Electric light rail, average occupancy',
    source: 'UK DESNZ · EEA',
    badge: 'Low carbon',
  },
  {
    mode: 'Local bus (Euro 6)',
    factor: `${EMISSION_FACTORS.bus}`,
    unit: 'g CO₂e / passenger-km',
    detail: 'Modern Euro 6 diesel bus, average load',
    source: 'UK DESNZ',
  },
  {
    mode: 'Electric vehicle',
    factor: `${EMISSION_FACTORS.ev}`,
    unit: 'g CO₂e / km',
    detail: 'Battery EV charged on the average EU grid',
    source: 'EEA · UK DESNZ',
  },
  {
    mode: 'Average petrol car',
    factor: `${EMISSION_FACTORS.car}`,
    unit: 'g CO₂e / km',
    detail: 'Solo occupancy baseline, average petrol engine',
    source: 'UK DESNZ',
    badge: 'Baseline',
  },
  {
    mode: 'Consolidated delivery',
    factor: `${EMISSION_FACTORS.delivery}`,
    unit: 'g CO₂e / parcel',
    detail: 'Flat last-mile baseline, many parcels per route',
    source: 'Scientific American / MIT',
    badge: 'Flat per parcel',
  },
];

const SOURCES = [
  {
    title: 'UK DESNZ GHG conversion factors',
    publisher: 'Department for Energy Security & Net Zero',
    description:
      'Official 2025/2026 conversion factors for company reporting, including passenger transport, vehicles and business travel.',
    href: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025',
    label: 'gov.uk · conversion factors',
  },
  {
    title: 'DESNZ conversion factor collection',
    publisher: 'UK Government',
    description:
      'The living collection page — always points to the latest annual factor release and methodology notes.',
    href: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting',
    label: 'gov.uk · living collection',
  },
  {
    title: 'European Environment Agency',
    publisher: 'EEA · transport & mobility',
    description:
      'EU data on passenger transport emissions, grid intensity and the decarbonisation of road transport.',
    href: 'https://www.eea.europa.eu/en/topics/in-depth/transport-and-mobility',
    label: 'eea.europa.eu · transport',
  },
  {
    title: 'How green is online shopping?',
    publisher: 'Scientific American',
    description:
      'Context for the consolidated last-mile delivery baseline, including returns and failed-delivery effects.',
    href: 'https://www.scientificamerican.com/article/how-green-is-online-shopping/',
    label: 'scientificamerican.com',
  },
  {
    title: 'MIT Center for Transportation & Logistics',
    publisher: 'MIT CTL',
    description:
      'Research on urban logistics, parcel consolidation and last-mile emissions.',
    href: 'https://ctl.mit.edu/',
    label: 'ctl.mit.edu',
  },
];

export function Methodology() {
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-carbon-900 p-5 sm:p-6">
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-label">Methodology &amp; sources</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
              Transparent numbers, not vibes.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/55">
              Every comparison in GreenStep uses published per-passenger
              emission factors. The table below is the exact model the app runs
              — with direct links to the underlying sources.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-400/20 bg-carbon-950/45 px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-[11px] text-zinc-400">
                Data review
              </p>
              <p className="text-xs font-bold text-emerald-100/85">
                2026/2025 factors
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className="surface-panel p-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <Leaf className="h-4 w-4" />
            <p className="text-[11px] font-semibold text-zinc-400">
              Per passenger
            </p>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-emerald-100/60">
            Transit, bus, EV and car figures are grams of CO₂e per
            passenger-kilometre, not per vehicle.
          </p>
        </div>
        <div className="surface-panel p-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <Link2 className="h-4 w-4" />
            <p className="text-[11px] font-semibold text-zinc-400">
              Round trip
            </p>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-emerald-100/60">
            Route comparisons double the one-way distance unless an option is
            marked as a delivery.
          </p>
        </div>
        <div className="surface-panel p-4">
          <div className="flex items-center gap-2 text-purple-300">
            <FileText className="h-4 w-4" />
            <p className="text-[11px] font-semibold text-zinc-400">
              Flat parcel
            </p>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-emerald-100/60">
            Delivery uses one consolidated baseline per parcel because a single
            van serves many orders.
          </p>
        </div>
      </div>

      <section className="surface-panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-5 py-4">
          <div>
            <p className="section-label">Emission factor table</p>
            <h3 className="mt-1 font-display text-lg font-bold text-zinc-100">
              What GreenStep calculates with
            </h3>
          </div>
          <span className="pill border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
            <ShieldCheck className="h-3 w-3" />
            Verified sources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[11px]">
            <thead className="bg-white/[0.03] text-[11px] text-zinc-400">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Mode</th>
                <th className="px-3 py-2.5 text-right font-semibold">Factor</th>
                <th className="px-3 py-2.5 font-semibold">Unit</th>
                <th className="hidden px-3 py-2.5 font-semibold md:table-cell">
                  Detail
                </th>
                <th className="px-5 py-2.5 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {FACTOR_ROWS.map((row) => (
                <tr
                  key={row.mode}
                  className="transition-colors hover:bg-white/[0.025]"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-emerald-100/80">
                        {row.mode}
                      </span>
                      {row.badge && (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-200/80">
                          {row.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="data-value text-sm font-semibold text-emerald-300">
                      {row.factor}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-zinc-400">{row.unit}</td>
                  <td className="hidden px-3 py-3 text-zinc-400 md:table-cell">
                    {row.detail}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-semibold text-emerald-100/55">
                      {row.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2 px-1">
          <BookOpen className="h-3.5 w-3.5 text-emerald-300" />
          <p className="section-label">Direct sources</p>
        </div>
        <div className="grid gap-2.5 md:grid-cols-2">
          {SOURCES.map((source) => (
            <a
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group surface-panel flex flex-col p-4 transition hover:border-emerald-400/30 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-bold text-zinc-100">
                    {source.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-300/55">
                    {source.publisher}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition group-hover:text-emerald-300" />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                {source.description}
              </p>
              <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-emerald-300/70">
                <Link2 className="h-3 w-3" />
                {source.label}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="surface-panel p-5">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-300" />
          <h3 className="font-display text-sm font-bold text-zinc-100">
            Limits of this model
          </h3>
        </div>
        <ul className="mt-3 grid gap-2.5 text-[11px] leading-relaxed text-zinc-400 sm:grid-cols-2">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            Real vehicles vary with occupancy, temperature, load, driving style
            and how electricity is generated.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            EV emissions use the average EU grid; charging from pure renewables
            would lower the figure.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
            Delivery excludes returns, packaging and express shipping, all of
            which can raise the real footprint.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            These are planning estimates, not certified life-cycle assessments.
            Use them to compare options, not to file a report.
          </li>
        </ul>
      </section>

      <p className="px-1 text-[11px] leading-relaxed text-zinc-400">
        GreenStep is a campus pilot built for the FAU Nuremberg and Bucharest
        sustainability workshops. Store locations come from OpenStreetMap;
        routes come from OSRM. Location is processed on-device.
      </p>
    </div>
  );
}

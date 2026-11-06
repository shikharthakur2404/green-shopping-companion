import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Location, RouteOption, Store } from '../types';
import { cn } from '../lib/utils';
import { formatDistance } from '../services/emissionService';
import { getCategoryLabel, haversineKm } from '../services/storeService';

interface MapProps {
  userLocation: Location;
  stores: Store[];
  selectedStore: Store | null;
  activeRoute: RouteOption | null;
  onSelectStore: (store: Store) => void;
  className?: string;
}

const FIFTEEN_MIN_WALK_KM = 1.25; // 5 km/h * 15 min

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'paper-div-icon',
    html: '<div class="paper-user-pin" title="Your origin"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function createStoreIcon(store: Store, userLoc: Location, active: boolean): L.DivIcon {
  const dist = haversineKm(userLoc, store.location);
  const isInsideWalk = dist <= FIFTEEN_MIN_WALK_KM;
  const initial = escapeHtml(store.name.charAt(0).toUpperCase());
  const pinClass = isInsideWalk ? 'paper-store-pin-solid' : 'paper-store-pin-hollow';
  const selectedClass = active ? ' is-selected' : '';

  return L.divIcon({
    className: 'paper-div-icon',
    html: `<div class="${pinClass}${selectedClass}" title="${escapeHtml(store.name)}">${initial}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function Map({
  userLocation,
  stores,
  selectedStore,
  activeRoute,
  onSelectStore,
  className,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const reachRingsLayerRef = useRef<L.LayerGroup | null>(null);
  const storeLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const selectStoreRef = useRef(onSelectStore);

  useEffect(() => {
    selectStoreRef.current = onSelectStore;
  }, [onSelectStore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    // Paper-tinted OpenStreetMap (keyless, zero watermark, compliant)
    const map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    }).setView([userLocation.lat, userLocation.lon], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const userMarker = L.marker([userLocation.lat, userLocation.lon], {
      icon: createUserIcon(),
      zIndexOffset: 1000,
      interactive: false,
    }).addTo(map);

    const reachRingsLayer = L.layerGroup().addTo(map);
    const storeLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    userMarkerRef.current = userMarker;
    reachRingsLayerRef.current = reachRingsLayer;
    storeLayerRef.current = storeLayer;
    routeLayerRef.current = routeLayer;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);

    const timer = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      reachRingsLayerRef.current = null;
      storeLayerRef.current = null;
      routeLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user location & reach rings
  useEffect(() => {
    const map = mapRef.current;
    const marker = userMarkerRef.current;
    const ringsLayer = reachRingsLayerRef.current;
    if (!map || !marker || !ringsLayer) return;

    marker.setLatLng([userLocation.lat, userLocation.lon]);

    // Draw reach rings around origin
    ringsLayer.clearLayers();

    const ringDefinitions = [
      { radiusM: 416, label: '5 min walk approx.' },
      { radiusM: 833, label: '10 min walk approx.' },
      { radiusM: 1250, label: '15 min walk approx.' },
      { radiusM: 2500, label: '10 min bike approx.' },
      { radiusM: 3750, label: '15 min bike approx.' },
    ];

    for (const ring of ringDefinitions) {
      const circle = L.circle([userLocation.lat, userLocation.lon], {
        radius: ring.radiusM,
        color: '#17211C',
        weight: 1,
        opacity: 0.22,
        fillColor: '#1E4D3B',
        fillOpacity: ring.radiusM <= 1250 ? 0.02 : 0,
        dashArray: '3, 4',
        interactive: false,
      });
      circle.addTo(ringsLayer);

      // Label at north edge of ring
      const latOffset = ring.radiusM / 111139; // ~deg lat per meter
      const labelMarker = L.marker([userLocation.lat + latOffset, userLocation.lon], {
        icon: L.divIcon({
          className: 'paper-div-icon',
          html: `<div class="text-[9px] font-mono tracking-tight text-ink-muted bg-paper/85 px-1 rounded-sm border border-hairline whitespace-nowrap">${ring.label}</div>`,
          iconAnchor: [35, 8],
        }),
        interactive: false,
      });
      labelMarker.addTo(ringsLayer);
    }
  }, [userLocation.lat, userLocation.lon]);

  // Update store pins
  useEffect(() => {
    const map = mapRef.current;
    const layer = storeLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    for (const store of stores) {
      const isSelected = selectedStore?.id === store.id;
      const marker = L.marker([store.location.lat, store.location.lon], {
        icon: createStoreIcon(store, userLocation, isSelected),
        riseOnHover: true,
      });

      marker.bindPopup(
        `<div class="p-1 font-sans text-xs">
          <p class="font-serif text-sm font-semibold text-ink">${escapeHtml(store.name)}</p>
          <p class="text-ink-muted text-[11px]">${escapeHtml(getCategoryLabel(store.category))} · ${escapeHtml(store.address)}</p>
          <p class="mt-1 font-mono text-[11px] font-medium text-forest">${formatDistance(store.distanceKm)} away</p>
        </div>`,
        { closeButton: false, offset: [0, -12] },
      );

      marker.on('click', () => selectStoreRef.current(store));
      marker.addTo(layer);
    }

    if (stores.length > 0 && !selectedStore) {
      const bounds = L.latLngBounds(
        stores.map(
          (store) => [store.location.lat, store.location.lon] as [number, number],
        ),
      );
      bounds.extend([userLocation.lat, userLocation.lon]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [stores, selectedStore, userLocation]);

  // Update route
  useEffect(() => {
    const layer = routeLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;

    layer.clearLayers();

    if (!activeRoute || activeRoute.coordinates.length < 2) return;

    const latLngs = activeRoute.coordinates.map(
      ([lat, lon]) => [lat, lon] as [number, number],
    );

    // Single source of truth route in Deep Forest Green
    L.polyline(latLngs, {
      color: '#1E4D3B',
      weight: 3.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(layer);

    if (selectedStore) {
      const bounds = L.latLngBounds(latLngs);
      bounds.extend([userLocation.lat, userLocation.lon]);
      bounds.extend([selectedStore.location.lat, selectedStore.location.lon]);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    }
  }, [activeRoute, selectedStore, userLocation.lat, userLocation.lon]);

  return (
    <div
      className={cn(
        'relative h-full w-full border border-hairline bg-surface overflow-hidden',
        className,
      )}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

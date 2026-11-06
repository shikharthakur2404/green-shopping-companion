import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Location, RouteOption, Store } from '../types';
import { cn } from '../lib/utils';
import { formatDistance } from '../services/emissionService';
import { STORE_CATEGORIES, getCategoryLabel } from '../services/storeService';

interface MapProps {
  userLocation: Location;
  stores: Store[];
  selectedStore: Store | null;
  activeRoute: RouteOption | null;
  onSelectStore: (store: Store) => void;
  className?: string;
}

const DEFAULT_PIN_COLOR = '#34d399';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function categoryColor(category: string): string {
  return (
    STORE_CATEGORIES.find((item) => item.tags.includes(category))?.accent ??
    DEFAULT_PIN_COLOR
  );
}

function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'greenstep-div-icon',
    html: '<div class="user-pin"><span></span></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function createStoreIcon(store: Store, active: boolean): L.DivIcon {
  const color = categoryColor(store.category);
  const initial = escapeHtml(store.name.charAt(0).toUpperCase());

  return L.divIcon({
    className: 'greenstep-div-icon',
    html: `<div class="store-pin${active ? ' is-active' : ''}" style="--pin-color:${color}"><span>${initial}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
  const storeLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const selectStoreRef = useRef(onSelectStore);

  useEffect(() => {
    selectStoreRef.current = onSelectStore;
  }, [onSelectStore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    }).setView([userLocation.lat, userLocation.lon], 14);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      },
    ).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const userMarker = L.marker([userLocation.lat, userLocation.lon], {
      icon: createUserIcon(),
      zIndexOffset: 1000,
      interactive: false,
    }).addTo(map);

    const storeLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    userMarkerRef.current = userMarker;
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
      storeLayerRef.current = null;
      routeLayerRef.current = null;
    };
    // The map is created once; subsequent updates are handled by effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = userMarkerRef.current;
    if (!map || !marker) return;

    marker.setLatLng([userLocation.lat, userLocation.lon]);
    map.flyTo([userLocation.lat, userLocation.lon], Math.max(map.getZoom(), 13), {
      duration: 0.7,
    });
  }, [userLocation.lat, userLocation.lon]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = storeLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    for (const store of stores) {
      const marker = L.marker([store.location.lat, store.location.lon], {
        icon: createStoreIcon(store, selectedStore?.id === store.id),
        riseOnHover: true,
      });

      marker.bindPopup(
        `<div class="map-popup">
          <p class="map-popup__eyebrow">${escapeHtml(getCategoryLabel(store.category))}</p>
          <p class="map-popup__title">${escapeHtml(store.name)}</p>
          <p class="map-popup__meta">${escapeHtml(store.address)}</p>
          <p class="map-popup__distance">${formatDistance(store.distanceKm)} away</p>
        </div>`,
        { closeButton: false, offset: [0, -14] },
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
      map.fitBounds(bounds, { padding: [42, 42], maxZoom: 15 });
    }
  }, [stores, selectedStore, userLocation.lat, userLocation.lon]);

  useEffect(() => {
    const layer = routeLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;

    layer.clearLayers();

    if (!activeRoute || activeRoute.coordinates.length < 2) return;

    const latLngs = activeRoute.coordinates.map(
      ([lat, lon]) => [lat, lon] as [number, number],
    );

    L.polyline(latLngs, {
      color: '#03120b',
      weight: 11,
      opacity: 0.65,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(layer);

    L.polyline(latLngs, {
      color: activeRoute.color,
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '1 0',
    }).addTo(layer);

    if (selectedStore) {
      const bounds = L.latLngBounds(latLngs);
      bounds.extend([userLocation.lat, userLocation.lon]);
      bounds.extend([selectedStore.location.lat, selectedStore.location.lon]);
      map.fitBounds(bounds, { padding: [54, 54], maxZoom: 15 });
    }
  }, [activeRoute, selectedStore, userLocation.lat, userLocation.lon]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-emerald-400/15 bg-carbon-900 shadow-panel',
        className,
      )}
    >
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 z-[390] rounded-3xl ring-1 ring-inset ring-white/5" />
    </div>
  );
}

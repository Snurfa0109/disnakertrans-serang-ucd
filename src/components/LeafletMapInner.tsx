'use client';

import { useEffect, useRef } from 'react';
import { kecamatanData, KecamatanInfo, KABUPATEN_SERANG_INFO } from './kecamatanMapData';
import geojsonData from '@/data/serang-kecamatan.json';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  selectedId: string | null;
  onSelectKecamatan: (id: string | null) => void;
}

// Bounding box of Kabupaten Serang mainland (prevents zooming out to entire Java island)
const SERANG_MAINLAND_BOUNDS: [[number, number], [number, number]] = [
  [-6.34, 105.82], // Barat Daya (Padarincang / Cinangka)
  [-5.91, 106.42], // Timur Laut (Pulo Ampel / Tanara)
];

export default function LeafletMapInner({ selectedId, onSelectKecamatan }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const featureLayersRef = useRef<Record<string, any>>({});
  const activeMarkerRef = useRef<any>(null);
  const onSelectRef = useRef(onSelectKecamatan);

  useEffect(() => {
    onSelectRef.current = onSelectKecamatan;
  }, [onSelectKecamatan]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return;

      // Reset default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '',
        iconUrl: '',
        shadowUrl: '',
      });

      // 1. Initialize Map focused on Kabupaten Serang mainland
      const map = L.map(containerRef.current, {
        center: [KABUPATEN_SERANG_INFO.centerLat, KABUPATEN_SERANG_INFO.centerLng],
        zoom: 10,
        minZoom: 9.5,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      mapRef.current = map;

      // 2. Add Zoom Control top-left
      L.control.zoom({ position: 'topleft' }).addTo(map);

      // 3. Add Tile Layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 9,
      }).addTo(map);

      // 4. Add Attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors')
        .addTo(map);

      // 5. Render Official GeoJSON Boundary Polygons
      L.geoJSON(geojsonData as any, {
        style: (feature: any) => {
          const fid = feature?.properties?.id;
          const isSelected = mapRef.current?._currentSelectedId === fid;
          return {
            color: isSelected ? '#ea580c' : '#0284c7', // Orange for selected, blue for default
            weight: isSelected ? 3 : 1.6,
            opacity: isSelected ? 1 : 0.85,
            fillColor: isSelected ? '#ea580c' : '#0284c7',
            fillOpacity: isSelected ? 0.42 : 0.14,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const fid = feature?.properties?.id;
          const name = feature?.properties?.name;

          featureLayersRef.current[fid] = layer;

          // Tooltip on Hover
          layer.bindTooltip(
            `<div style="font-weight: 700; font-size: 11px; color: #0f172a; padding: 2px 4px;">${name}</div>`,
            {
              direction: 'center',
              permanent: false,
              sticky: true,
              className: 'custom-leaflet-tooltip',
            }
          );

          // Hover interactions
          layer.on('mouseover', () => {
            const isSelected = mapRef.current?._currentSelectedId === fid;
            if (!isSelected) {
              layer.setStyle({
                weight: 2.6,
                fillOpacity: 0.28,
                color: '#0369a1',
              });
            }
          });

          layer.on('mouseout', () => {
            const isSelected = mapRef.current?._currentSelectedId === fid;
            if (!isSelected) {
              layer.setStyle({
                color: '#0284c7',
                weight: 1.6,
                fillColor: '#0284c7',
                fillOpacity: 0.14,
              });
            }
          });

          // Click to Select
          layer.on('click', () => {
            onSelectRef.current(fid);
          });
        },
      }).addTo(map);

      // Fit map bounds cleanly to Kabupaten Serang mainland (never zoom out to entire Java)
      map.fitBounds(SERANG_MAINLAND_BOUNDS, { padding: [15, 15] });

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update selection, polygon styles, and active pin marker
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    map._currentSelectedId = selectedId;

    import('leaflet').then((L) => {
      // 1. Remove previous active marker
      if (activeMarkerRef.current) {
        map.removeLayer(activeMarkerRef.current);
        activeMarkerRef.current = null;
      }

      // 2. Update styles for all polygon features
      Object.entries(featureLayersRef.current).forEach(([fid, layer]) => {
        const isSelected = selectedId === fid;
        if (isSelected) {
          layer.setStyle({
            color: '#ea580c', // Bright orange border (Wilayah terpilih)
            weight: 3.2,
            opacity: 1,
            fillColor: '#ea580c',
            fillOpacity: 0.42,
          });
          layer.bringToFront();
        } else {
          layer.setStyle({
            color: '#0284c7', // Cyan-blue border (Wilayah kecamatan)
            weight: 1.6,
            opacity: 0.85,
            fillColor: '#0284c7',
            fillOpacity: 0.14,
          });
        }
      });

      // 3. Zoom / Fly to view & add active marker
      if (!selectedId || selectedId === 'kab-serang') {
        map.fitBounds(SERANG_MAINLAND_BOUNDS, {
          padding: [15, 15],
          animate: true,
        });
      } else {
        const selectedLayer = featureLayersRef.current[selectedId];
        const selectedKec = kecamatanData.find((k: KecamatanInfo) => k.id === selectedId);

        if (selectedLayer) {
          // Fit to polygon bounds smoothly
          map.fitBounds(selectedLayer.getBounds(), {
            padding: [40, 40],
            maxZoom: 13,
            animate: true,
          });
        } else if (selectedKec) {
          map.flyTo([selectedKec.lat, selectedKec.lng], 12.5, { duration: 1 });
        }

        // Place custom prominent pin at selected kecamatan's centroid
        if (selectedKec) {
          const activePinIcon = L.divIcon({
            className: 'active-selected-pin',
            html: `
              <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); cursor:pointer;">
                <div style="
                  background: #0f172a;
                  color: #ffffff;
                  border: 2px solid #ea580c;
                  font-weight: 800;
                  font-size: 12px;
                  padding: 3px 10px;
                  border-radius: 9999px;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
                  white-space: nowrap;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                ">
                  <span style="width:6px; height:6px; border-radius:50%; background:#ea580c; display:inline-block;"></span>
                  <span>${selectedKec.name}</span>
                </div>
                <div style="width: 2px; height: 8px; background: #ea580c;"></div>
                <div style="
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: #ea580c;
                  border: 2.5px solid #ffffff;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const marker = L.marker([selectedKec.lat, selectedKec.lng], { icon: activePinIcon }).addTo(map);
          activeMarkerRef.current = marker;
        }
      }
    });
  }, [selectedId]);

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] lg:h-[540px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 isolate z-0">
      <div ref={containerRef} className="w-full h-full relative z-0" />

      {/* Legend Overlay (Top Right) - Matches screenshot */}
      <div className="absolute top-3.5 right-3.5 z-20 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs font-semibold text-gray-700 dark:text-gray-200 pointer-events-none select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm border-2 border-[#0284c7] bg-[#0284c7]/25 inline-block shrink-0" />
          <span>Wilayah kecamatan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm border-2 border-[#ea580c] bg-[#ea580c]/40 inline-block shrink-0" />
          <span>Wilayah terpilih</span>
        </div>
      </div>

      {/* Bottom Left Badge - Matches screenshot */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#0b5c7e] text-white px-3.5 py-1.5 rounded-lg shadow-md font-bold text-xs tracking-wide pointer-events-none">
        {selectedId && selectedId !== 'kab-serang'
          ? (kecamatanData.find((k) => k.id === selectedId)?.name || 'Kabupaten Serang')
          : 'Kabupaten Serang'}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "@/lib/types";

type Props = {
  fc: FeatureCollection | null;
  height?: number;
  center?: [number, number];
  zoom?: number;
};

/**
 * Leaflet wrapper. Imported dynamically so it never runs during SSR.
 * Renders Point features as markers and LineString features as polylines.
 */
export default function MapView({ fc, height = 380, center = [-70, 40], zoom = 2 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      const map = L.map(ref.current, { worldCopyJump: true }).setView(center, zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 18,
      }).addTo(map);

      // default marker icons break under bundlers; use circle markers instead
      const bounds: [number, number][] = [];

      for (const f of fc?.features ?? []) {
        const name = String(f.properties?.name ?? f.properties?.title ?? "feature");
        const kind = String(f.properties?.kind ?? "");
        const geom = f.geometry;

        if (geom.type === "Point") {
          const [lon, lat] = geom.coordinates as number[];
          bounds.push([lat, lon]);
          L.circleMarker([lat, lon], {
            radius: 7,
            color: kind === "station" ? "#8fc8e8" : "#55a8d8",
            weight: 2,
            fillColor: "#2f8bc4",
            fillOpacity: 0.9,
          })
            .addTo(map)
            .bindPopup(`<strong>${name}</strong>${kind ? `<br/><em>${kind}</em>` : ""}`);
        } else if (geom.type === "LineString") {
          const pts = (geom.coordinates as number[][]).map(([lon, lat]) => [lat, lon] as [number, number]);
          if (pts.length) {
            bounds.push(...pts);
            L.polyline(pts, { color: "#55a8d8", weight: 3, dashArray: "6 6" })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong>`);
          }
        }
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 4);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [fc, center, zoom]);

  return <div ref={ref} style={{ height }} className="overflow-hidden rounded-xl border border-white/10" />;
}

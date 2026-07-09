"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import {
  CORDOBA_CAPITAL_BOUNDS,
  CORDOBA_CAPITAL_CENTER,
  LOCAL_OA_POSITION,
} from "@/constants/cordobaMap";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl.src ?? iconRetinaUrl,
    iconUrl: iconUrl.src ?? iconUrl,
    shadowUrl: shadowUrl.src ?? shadowUrl,
  });
}

function MapUpdater({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (!coordinates) return;
    map.flyTo(coordinates, 16, { duration: 1.2 });
  }, [coordinates, map]);
  return null;
}

/** Restringe pan/zoom al área urbana de Córdoba capital. */
function MapBoundsController() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(CORDOBA_CAPITAL_BOUNDS);
    map.setMinZoom(13);
  }, [map]);
  return null;
}

export default function LeafletAddressMap({ userLocation, zoom = 15 }) {
  const localIcon = useMemo(
    () =>
      L.divIcon({
        className: "oa-local-marker",
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#C1121F;border:2px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);">
            <img src="/favicon-32.png" alt="Oa!" style="width:26px;height:26px;border-radius:9999px;object-fit:cover;" />
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -38],
      }),
    [],
  );

  const center = userLocation ?? CORDOBA_CAPITAL_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      maxBounds={CORDOBA_CAPITAL_BOUNDS}
      maxBoundsViscosity={1}
      minZoom={13}
      style={{ width: "100%", height: "100%" }}
      className="z-0"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={20}
      />
      <Marker position={userLocation} />
      <Marker position={LOCAL_OA_POSITION} icon={localIcon}>
        <Popup>📍 Local Oa! Bebidas — Rondeau 401</Popup>
      </Marker>
      <MapBoundsController />
      <MapUpdater coordinates={userLocation} />
    </MapContainer>
  );
}

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { MapPosition } from '../types';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  startPoint: MapPosition;
  endPoint: MapPosition;
  onStartPointChange: (pos: MapPosition) => void;
  onEndPointChange: (pos: MapPosition) => void;
  visitedNodes: MapPosition[];
  pathNodes: MapPosition[];
  isRunning: boolean;
}

const startIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ startPoint, endPoint }: { startPoint: MapPosition; endPoint: MapPosition }) {
  const map = useMap();

  useEffect(() => {
    const bounds = new LatLng(startPoint.lat, startPoint.lng).toBounds(5000);
    bounds.extend(new LatLng(endPoint.lat, endPoint.lng));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, startPoint, endPoint]);

  return null;
}

export function MapView({
  startPoint,
  endPoint,
  onStartPointChange,
  onEndPointChange,
  visitedNodes,
  pathNodes,
  isRunning,
}: MapViewProps) {
  const markerRefs = useRef<{ start: any; end: any }>({ start: null, end: null });

  return (
    <MapContainer
      center={[40.7128, -74.0060]}
      zoom={13}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater startPoint={startPoint} endPoint={endPoint} />

      {visitedNodes.map((node, index) => (
        <CircleMarker
          key={`visited-${index}`}
          center={[node.lat, node.lng]}
          radius={3}
          pathOptions={{
            fillColor: '#60a5fa',
            fillOpacity: 0.4,
            stroke: false,
          }}
        />
      ))}

      {pathNodes.length > 1 && (
        <Polyline
          positions={pathNodes.map(p => [p.lat, p.lng])}
          pathOptions={{
            color: '#10b981',
            weight: 4,
            opacity: 0.8,
          }}
        />
      )}

      <Marker
        ref={(ref) => (markerRefs.current.start = ref)}
        position={[startPoint.lat, startPoint.lng]}
        icon={startIcon}
        draggable={!isRunning}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onStartPointChange({ lat: position.lat, lng: position.lng });
          },
        }}
      />

      <Marker
        ref={(ref) => (markerRefs.current.end = ref)}
        position={[endPoint.lat, endPoint.lng]}
        icon={endIcon}
        draggable={!isRunning}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onEndPointChange({ lat: position.lat, lng: position.lng });
          },
        }}
      />
    </MapContainer>
  );
}

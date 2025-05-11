import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// Fix for Leaflet.heat TypeScript definition
// This extends the Leaflet namespace to include the heatLayer function
declare module 'leaflet' {
  function heatLayer(latlngs: Array<[number, number, number?]>, options?: any): any;
}

interface HeatmapLayerProps {
  data: Array<{
    lat: number;
    lng: number;
    intensity: number;
  }>;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ data }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Convert data for heatmap
    const points = data.map(point => [
      point.lat,
      point.lng,
      point.intensity
    ] as [number, number, number]);
    
    // Create and add heatmap layer
    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: {0.4: '#3b82f6', 0.65: '#10b981', 1: '#ef4444'}
    }).addTo(map);
    
    // Fit bounds to the data
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p[0], p[1]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Cleanup on unmount
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, data]);
  
  return null;
};

export default HeatmapLayer; 
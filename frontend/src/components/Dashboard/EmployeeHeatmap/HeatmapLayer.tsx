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
    radius?: number;
  }>;
  // Options for configuring the heatmap
  options?: {
    baseRadius?: number;
    blur?: number;
    maxZoom?: number;
    gradient?: {[key: string]: string};
  };
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ 
  data,
  options = {} 
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Set defaults for options
    const {
      blur = 15,
      maxZoom = 10,
      gradient = {0.4: '#3b82f6', 0.65: '#10b981', 1: '#ef4444'}
    } = options;
    
    // Create a separate layer for each point with dynamic radius
    const layers: L.Layer[] = [];
    
    data.forEach(point => {
      // Radius can be specified directly, or calculated from intensity
      const radius = point.radius || Math.min(15 + point.intensity * 0.5, 45);
      
      // Convert data for heatmap - create individual point
      const pointData = [[
        point.lat,
        point.lng,
        point.intensity
      ]] as [number, number, number][];
      
      // Create and add heat layer for this point
      const pointLayer = L.heatLayer(pointData, {
        radius,
        blur,
        maxZoom,
        minOpacity: 0.4,
        gradient
      }).addTo(map);
      
      layers.push(pointLayer);
    });
    
    // Fit bounds to the data
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Cleanup on unmount
    return () => {
      layers.forEach(layer => {
        map.removeLayer(layer);
      });
    };
  }, [map, data, options]);
  
  return null;
};

export default HeatmapLayer; 
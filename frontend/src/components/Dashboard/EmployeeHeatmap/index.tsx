import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import fixLeafletIcons from './leaflet-icon-fix';
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders } from '../../../utils/api';

// Fix Leaflet icon issues
fixLeafletIcons();

// Placeholder data for initial testing
const dummyData = [
  { lat: 34.0522, lng: -118.2437, intensity: 15 }, // Los Angeles
  { lat: 40.7128, lng: -74.0060, intensity: 25 },  // New York
  { lat: -26.2041, lng: 28.0473, intensity: 30 },  // Johannesburg
  { lat: -33.9249, lng: 18.4241, intensity: 20 },  // Cape Town
  { lat: 51.5074, lng: -0.1278, intensity: 10 },   // London
  { lat: 48.8566, lng: 2.3522, intensity: 8 },     // Paris
  { lat: 35.6762, lng: 139.6503, intensity: 12 },  // Tokyo
];

interface LocationPoint {
  lat: number;
  lng: number;
  intensity: number;
}

const EmployeeHeatmap: React.FC = () => {
  const [connectionData, setConnectionData] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnectionLocations = async () => {
      try {
        setLoading(true);
        
        // For initial testing, just use the dummy data
        // In production, uncomment this code to fetch real data
        
        /*
        // Create URL for the connection locations endpoint
        // You may need to create this endpoint on your backend
        const url = buildEnterpriseUrl(ENDPOINTS.CONNECTION_LOCATIONS || "/connections/locations");
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the data if needed
        const formattedData = data.map(item => ({
          lat: item.latitude,
          lng: item.longitude,
          intensity: item.connectionCount
        }));
        
        setConnectionData(formattedData);
        */
        
        // Using dummy data for now
        setConnectionData(dummyData);
        setError(null);
      } catch (err) {
        console.error("Error fetching connection locations:", err);
        setError("Failed to load heatmap data");
      } finally {
        // Add a small delay to simulate loading
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    
    fetchConnectionLocations();
  }, []);

  return (
    <div className="heatmap-container">
      {loading ? (
        <div className="loading-indicator">Loading networking data...</div>
      ) : error ? (
        <div className="error-indicator">{error}</div>
      ) : (
        <MapContainer 
          center={[-26.2041, 28.0473]} // Default center (Johannesburg)
          zoom={2} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <HeatmapLayer data={connectionData} />
        </MapContainer>
      )}
    </div>
  );
};

export default EmployeeHeatmap; 
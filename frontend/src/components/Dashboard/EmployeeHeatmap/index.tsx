import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import fixLeafletIcons from './leaflet-icon-fix';
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders } from '../../../utils/api';

// Fix Leaflet icon issues
fixLeafletIcons();

// Sample data for testing when API fails
const sampleData = [
  { lat: -25.757, lng: 28.1443, intensity: 15, radius: 20 }, // Pretoria
  { lat: -26.1, lng: 28.25, intensity: 20, radius: 25 }, // Thembisa
  { lat: -26.2041, lng: 28.0473, intensity: 30, radius: 35 }, // Johannesburg
  { lat: -33.9249, lng: 18.4241, intensity: 18, radius: 22 }, // Cape Town
  { lat: -29.8587, lng: 31.0218, intensity: 22, radius: 28 }, // Durban
];

// Define contact interface based on enterprise API response
interface Contact {
  name: string;
  surname: string;
  phone: string;
  howWeMet: string;
  email: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  ownerInfo: {
    userId: string;
    email: string;
    department: string;
    departmentName?: string;
  };
  enterpriseId: string;
  enterpriseName?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Define API response interfaces
interface EnterpriseContactsResponse {
  success: boolean;
  cached: boolean;
  data: {
    enterpriseId: string;
    enterpriseName: string;
    totalContacts: number;
    totalDepartments: number;
    departmentStats: Record<string, {
      name: string;
      contactCount: number;
      contacts: Contact[];
    }>;
  };
}

interface LocationPoint {
  lat: number;
  lng: number;
  intensity: number;
  radius: number;
}

// Function to cluster nearby points and adjust intensity
const clusterLocationData = (contacts: Contact[]): LocationPoint[] => {
  // First, filter valid locations
  const validContacts = contacts.filter(
    contact => contact.location && 
    typeof contact.location.latitude === 'number' && 
    typeof contact.location.longitude === 'number'
  );
  
  console.log(`Found ${validContacts.length} contacts with valid location data`);
  
  if (validContacts.length === 0) return [];
  
  // Create a grid system for clustering
  // Each cell is roughly 5km x 5km (approximate at the equator)
  const GRID_SIZE = 0.05; // degrees
  const locationGrid: { [key: string]: number } = {};
  
  // Count contacts in each grid cell
  validContacts.forEach(contact => {
    const latGrid = Math.floor(contact.location!.latitude / GRID_SIZE);
    const lngGrid = Math.floor(contact.location!.longitude / GRID_SIZE);
    const gridKey = `${latGrid},${lngGrid}`;
    
    if (!locationGrid[gridKey]) {
      locationGrid[gridKey] = 1;
    } else {
      locationGrid[gridKey]++;
    }
  });
  
  // Get max count for normalization
  const maxCount = Math.max(...Object.values(locationGrid));
  
  // Convert to array of points with intensity and radius based on count
  const pointsArray: LocationPoint[] = [];
  
  for (const gridKey in locationGrid) {
    const [latGrid, lngGrid] = gridKey.split(',').map(Number);
    
    // Find all contacts in this grid cell to calculate average position
    const contactsInCell = validContacts.filter(contact => {
      const lat = contact.location!.latitude;
      const lng = contact.location!.longitude;
      return Math.floor(lat / GRID_SIZE) === latGrid && 
             Math.floor(lng / GRID_SIZE) === lngGrid;
    });
    
    // Calculate average position
    const avgLat = contactsInCell.reduce((sum, c) => sum + c.location!.latitude, 0) / contactsInCell.length;
    const avgLng = contactsInCell.reduce((sum, c) => sum + c.location!.longitude, 0) / contactsInCell.length;
    
    // Calculate count and normalized value (0-1)
    const count = locationGrid[gridKey];
    const normalizedValue = count / maxCount;
    
    // Calculate intensity - scale with count
    const intensity = Math.min(10 + count * 5, 50); // Scale up with count, cap at 50
    
    // Calculate radius - make it proportional to the count
    // Base size of 15 for smallest points, up to 40 for largest concentrations
    const radius = Math.max(15 + Math.round(normalizedValue * 35), 15);
    
    pointsArray.push({
      lat: avgLat,
      lng: avgLng,
      intensity,
      radius
    });
  }
  
  console.log(`Created ${pointsArray.length} clustered points from ${validContacts.length} contacts with varying sizes`);
  return pointsArray;
};

const EmployeeHeatmap: React.FC = () => {
  const [connectionData, setConnectionData] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState<boolean>(false);
  useEffect(() => {
    const fetchContactLocations = async () => {
      try {
        setLoading(true);
        
        // Use enterprise contacts endpoint
        const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CONTACTS);
        console.log('Fetching contact data from URL:', url);
        
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
          // Parse the response
        const responseData: EnterpriseContactsResponse = await response.json();
        console.log('Raw API response:', responseData);
        
        // Extract contacts data from all departments
        let contactsData: Contact[] = [];
        
        if (responseData && responseData.data && responseData.data.departmentStats) {
          // Flatten contacts from all departments
          Object.values(responseData.data.departmentStats).forEach(department => {
            if (department.contacts && Array.isArray(department.contacts)) {
              contactsData.push(...department.contacts);
            }
          });
          console.log('Found contacts from enterprise departments');
        } else {
          console.log('Unexpected response format, could not extract contacts');
        }
        
        console.log(`Extracted ${contactsData.length} contacts`);
        
        // Cluster and transform contact data to heatmap format
        const locationData = clusterLocationData(contactsData);
        console.log('Final location data for heatmap:', locationData);
        
        if (locationData.length > 0) {
          setConnectionData(locationData);
          setUsingSampleData(false);
        } else {
          console.log('No location data found in API response, using sample data');
          setConnectionData(sampleData);
          setUsingSampleData(true);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching contact locations:", err);
        setError(`Failed to load from API: ${err instanceof Error ? err.message : String(err)}`);
        console.log('Using sample data due to API error');
        setConnectionData(sampleData);
        setUsingSampleData(true);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };
    
    fetchContactLocations();
  }, []);

  return (
    <div className="heatmap-container">
      {loading ? (
        <div className="loading-indicator">Loading networking data...</div>
      ) : error ? (
        <div className="error-indicator">
          {error}
          <p>Using sample location data instead.</p>
        </div>
      ) : (
        <MapContainer 
          center={[-26.2041, 28.0473]} // Default center (Johannesburg)
          zoom={6} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <HeatmapLayer 
            data={connectionData} 
            options={{
              blur: 15,
              maxZoom: 10,
              gradient: {0.4: '#3b82f6', 0.65: '#10b981', 1: '#ef4444'}
            }}
          />
          {usingSampleData && (
            <div className="sample-data-notice" style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '5px 10px',
              borderRadius: '4px',
              zIndex: 1000,
              fontSize: '12px'
            }}>
              Using sample data
            </div>
          )}
        </MapContainer>
      )}
      {/* {debugInfo && (
        <details style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000, maxWidth: '300px' }}>
          <summary style={{ backgroundColor: 'white', padding: '5px', cursor: 'pointer' }}>Debug Info</summary>
          <pre style={{ fontSize: '10px', maxHeight: '200px', overflow: 'auto', backgroundColor: 'white', padding: '5px' }}>
            {debugInfo}
          </pre>
        </details>
      )} */}
    </div>
  );
};

export default EmployeeHeatmap; 
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import fixLeafletIcons from './leaflet-icon-fix';
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders } from '../../../utils/api';

// Fix Leaflet icon issues
fixLeafletIcons();

// Removed sample data - only use real backend data

// Define contact interface based on actual API response
interface Contact {
  name: string;
  surname: string;
  email: string;
  phone: string;
  company?: string;
  howWeMet: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  location?: {
    name?: string;
    latitude: number;
    longitude: number;
    city: string;
    region: string;
    country: string;
    countryCode: string;
    timezone: string;
    provider: string;
    area?: string;
    createdAt?: {
      _seconds: number;
      _nanoseconds: number;
    };
    assignedAt?: string;
    randomized?: boolean;
  };
  ownerInfo: {
    userId: string;
    email: string;
    department: string;
  };
  enterpriseId: string;
}

// Define API response interfaces based on actual API response
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
      employeeCount: number;
    }>;
    contactsByDepartment: Record<string, {
      departmentName: string;
      departmentId: string;
      contacts: Contact[];
      contactCount: number;
    }>;
    generatedAt: string;
    cacheExpiry: string;
  };
  timestamp: string;
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
  
  console.log(`🗺️  Found ${validContacts.length} contacts with valid location data out of ${contacts.length} total contacts`);
  
  // Log some location details for debugging
  if (validContacts.length > 0) {
    const firstContact = validContacts[0];
    console.log(`📍 Sample location data:`, {
      name: `${firstContact.name} ${firstContact.surname}`,
      city: firstContact.location?.city,
      coordinates: `${firstContact.location?.latitude}, ${firstContact.location?.longitude}`,
      provider: firstContact.location?.provider
    });
  }
  
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
  
  console.log(`🎯 Created ${pointsArray.length} clustered heat map points from ${validContacts.length} contacts with location data`);
  
  // Log clustering summary
  if (pointsArray.length > 0) {
    const totalIntensity = pointsArray.reduce((sum, p) => sum + p.intensity, 0);
    const avgIntensity = (totalIntensity / pointsArray.length).toFixed(1);
    console.log(`📊 Heat map intensity range: ${Math.min(...pointsArray.map(p => p.intensity))} - ${Math.max(...pointsArray.map(p => p.intensity))} (avg: ${avgIntensity})`);
  }
  
  return pointsArray;
};

const EmployeeHeatmap: React.FC = () => {
  const [connectionData, setConnectionData] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
        
        // Extract contacts data from all departments using actual API format
        let contactsData: Contact[] = [];
        
        if (responseData && responseData.data && responseData.data.contactsByDepartment) {
          // Flatten contacts from all departments
          Object.values(responseData.data.contactsByDepartment).forEach(department => {
            console.log(`Processing department: ${department.departmentName} with ${department.contactCount} contacts`);
            
            if (department.contacts && Array.isArray(department.contacts)) {
              contactsData.push(...department.contacts);
              console.log(`✅ Added ${department.contacts.length} contacts from department: ${department.departmentName}`);
            }
          });
          console.log(`✅ Found contacts from ${Object.keys(responseData.data.contactsByDepartment).length} enterprise departments`);
        } else {
          console.log('❌ Unexpected response format, could not extract contacts');
          console.log('Response structure:', JSON.stringify(responseData, null, 2));
        }
        
        console.log(`Extracted ${contactsData.length} contacts`);
        
        // Cluster and transform contact data to heatmap format
        const locationData = clusterLocationData(contactsData);
        console.log('Final location data for heatmap:', locationData);
        
        if (locationData.length > 0) {
          setConnectionData(locationData);
          setError(null);
          console.log(`✅ Successfully loaded ${locationData.length} location points from backend data`);
        } else {
          console.log('❌ No location data found in API response');
          setConnectionData([]);
          setError('No location data available from contacts');
        }
      } catch (err) {
        console.error("❌ Error fetching contact locations:", err);
        setError(`Failed to load from API: ${err instanceof Error ? err.message : String(err)}`);
        setConnectionData([]);
        console.log('🚫 No fallback data - will show error message');
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
      ) : error || connectionData.length === 0 ? (
        <div className="error-indicator">
          <h3>No Heat Map Data Available</h3>
          <p>{error || 'No contacts with location data found.'}</p>
          <p>Heat map will display when contacts have location information.</p>
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
          <div className="backend-data-notice" style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.9)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            zIndex: 1000,
            fontSize: '12px',
            fontWeight: '500'
          }}>
            ✅ Real backend data ({connectionData.length} locations)
          </div>
        </MapContainer>
      )}
    </div>
  );
};

export default EmployeeHeatmap; 
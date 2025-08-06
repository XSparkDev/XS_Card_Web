# 🌍 Heat Map Integration Guide - Frontend Documentation

## 📋 **Overview**

This guide provides everything the frontend team needs to integrate location-based heat maps using the enterprise contacts data. The backend is **100% ready** with location data for all contacts.

---

## 🎯 **Quick Start**

### **Endpoint to Use**
```
GET /enterprise/{enterpriseId}/contacts/details
```

### **Example Request**
```javascript
const response = await fetch(`/enterprise/x-spark-test/contacts/details`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

---

## 📊 **Response Structure**

### **Complete Response Format**
```javascript
{
  "success": true,
  "cached": false,
  "data": {
    "enterpriseId": "x-spark-test",
    "enterpriseName": "X Spark Test",
    "totalContacts": 7,
    "totalEmployees": 43,
    "calculationTime": "45ms",
    "departments": [
      {
        "departmentId": "hr",
        "departmentName": "HR",
        "totalContacts": 6,
        "totalEmployees": 22,
        "employees": [
          {
            "employeeId": "emp-123",
            "userId": "BPxFmmG6SVXvbwwRJ0YjBnuI8e73",
            "employeeName": "John Doe",
            "employeeEmail": "john@company.com",
            "employeeRole": "manager",
            "contactCount": 4,
            "contacts": [
              {
                "name": "Pppp",
                "surname": "Qqqq",
                "email": "contact@example.com",
                "phone": "097979797979",
                "company": "Pzbzhsosm",
                "howWeMet": "Networking event",
                "createdAt": "2025-08-06T11:27:21.363Z",
                "location": {
                  "latitude": -26.02046687440765,
                  "longitude": 28.35187185994057,
                  "city": "Kempton Park",
                  "region": "Gauteng",
                  "country": "South Africa",
                  "countryCode": "ZA",
                  "timezone": "Africa/Johannesburg",
                  "area": "norkem_park",
                  "name": "1 Breerivier Street, Norkem Park",
                  "provider": "retroactive_assignment"
                }
              }
              // ... more contacts
            ]
          }
          // ... more employees
        ]
      }
      // ... more departments
    ]
  },
  "timestamp": "2025-08-06T16:11:38.825Z"
}
```

---

## 🗺️ **Heat Map Data Extraction**

### **Extract Heat Map Points**
```javascript
function extractHeatMapPoints(apiResponse) {
  const heatMapPoints = [];
  
  if (!apiResponse.success || !apiResponse.data.departments) {
    return heatMapPoints;
  }
  
  apiResponse.data.departments.forEach(department => {
    department.employees.forEach(employee => {
      employee.contacts.forEach(contact => {
        // Only include contacts with valid location data
        if (contact.location && 
            contact.location.latitude && 
            contact.location.longitude) {
          
          heatMapPoints.push({
            // Required for heat map
            lat: contact.location.latitude,
            lng: contact.location.longitude,
            weight: 1, // Can be adjusted based on importance
            
            // Additional context data
            contact: {
              name: `${contact.name} ${contact.surname}`,
              email: contact.email,
              phone: contact.phone,
              company: contact.company,
              howWeMet: contact.howWeMet,
              createdAt: contact.createdAt
            },
            
            // Location details
            location: {
              city: contact.location.city,
              region: contact.location.region,
              country: contact.location.country,
              area: contact.location.area,
              name: contact.location.name
            },
            
            // Employee context
            employee: {
              name: employee.employeeName,
              email: employee.employeeEmail,
              role: employee.employeeRole,
              department: department.departmentName
            }
          });
        }
      });
    });
  });
  
  return heatMapPoints;
}
```

### **Usage Example**
```javascript
// Fetch and process data
async function loadHeatMapData(enterpriseId) {
  try {
    const response = await fetch(`/enterprise/${enterpriseId}/contacts/details`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch contacts');
    }
    
    // Extract heat map points
    const heatMapPoints = extractHeatMapPoints(data);
    
    console.log(`📍 Loaded ${heatMapPoints.length} heat map points`);
    return heatMapPoints;
    
  } catch (error) {
    console.error('❌ Error loading heat map data:', error);
    return [];
  }
}
```

---

## 🌍 **Google Maps Integration**

### **Basic Heat Map Setup**
```javascript
// Initialize Google Map with heat map
async function initializeHeatMap(enterpriseId) {
  // Load Google Maps
  const { Map } = await google.maps.importLibrary("maps");
  const { HeatmapLayer } = await google.maps.importLibrary("visualization");
  
  // Create map centered on South Africa (adjust as needed)
  const map = new Map(document.getElementById("map"), {
    zoom: 10,
    center: { lat: -26.0, lng: 28.1 }, // Gauteng area
    mapId: "YOUR_MAP_ID"
  });
  
  // Load heat map data
  const heatMapPoints = await loadHeatMapData(enterpriseId);
  
  // Convert to Google Maps LatLng format
  const heatMapData = heatMapPoints.map(point => ({
    location: new google.maps.LatLng(point.lat, point.lng),
    weight: point.weight
  }));
  
  // Create heat map layer
  const heatmap = new HeatmapLayer({
    data: heatMapData,
    map: map,
    radius: 50,
    opacity: 0.8
  });
  
  // Add markers for office locations (optional)
  addOfficeMarkers(map);
  
  return { map, heatmap, points: heatMapPoints };
}

// Add office location markers
function addOfficeMarkers(map) {
  const offices = [
    {
      name: "Constantia Hotel Area, Midrand",
      position: { lat: -25.9895, lng: 28.1279 },
      color: "#FF4B6E"
    },
    {
      name: "1st May Street, Tembisa", 
      position: { lat: -25.9957, lng: 28.2293 },
      color: "#1B2B5B"
    },
    {
      name: "1 Breerivier Street, Norkem Park",
      position: { lat: -26.0327, lng: 28.3473 },
      color: "#00C851"
    }
  ];
  
  offices.forEach(office => {
    new google.maps.Marker({
      position: office.position,
      map: map,
      title: office.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: office.color,
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF'
      }
    });
  });
}
```

### **Interactive Features**
```javascript
// Add click handlers for detailed information
function addInteractiveFeatures(map, heatMapPoints) {
  const infoWindow = new google.maps.InfoWindow();
  
  // Add markers for individual contacts (optional)
  heatMapPoints.forEach(point => {
    const marker = new google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: map,
      title: point.contact.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 5,
        fillColor: '#FF4B6E',
        fillOpacity: 0.8,
        strokeWeight: 1,
        strokeColor: '#FFFFFF'
      }
    });
    
    // Add click listener
    marker.addListener('click', () => {
      const content = `
        <div style="max-width: 300px;">
          <h3>${point.contact.name}</h3>
          <p><strong>Company:</strong> ${point.contact.company}</p>
          <p><strong>Location:</strong> ${point.location.city}, ${point.location.country}</p>
          <p><strong>How we met:</strong> ${point.contact.howWeMet}</p>
          <p><strong>Employee:</strong> ${point.employee.name} (${point.employee.department})</p>
          <p><strong>Contact created:</strong> ${new Date(point.contact.createdAt).toLocaleDateString()}</p>
        </div>
      `;
      
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    });
  });
}
```

---

## 📊 **Analytics & Statistics**

### **Generate Location Statistics**
```javascript
function generateLocationStats(heatMapPoints) {
  const stats = {
    total: heatMapPoints.length,
    byArea: {},
    byDepartment: {},
    byCountry: {},
    byCity: {}
  };
  
  heatMapPoints.forEach(point => {
    // By area
    const area = point.location.area || 'Unknown';
    stats.byArea[area] = (stats.byArea[area] || 0) + 1;
    
    // By department
    const dept = point.employee.department;
    stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
    
    // By country
    const country = point.location.country;
    stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
    
    // By city
    const city = point.location.city;
    stats.byCity[city] = (stats.byCity[city] || 0) + 1;
  });
  
  return stats;
}

// Usage
const stats = generateLocationStats(heatMapPoints);
console.log('📊 Location Statistics:', stats);
```

---

## 🎨 **UI Components**

### **Heat Map Controls**
```javascript
// Add controls for heat map customization
function addHeatMapControls(heatmap, heatMapPoints) {
  // Intensity slider
  const intensitySlider = document.getElementById('intensity-slider');
  intensitySlider.addEventListener('input', (e) => {
    heatmap.set('opacity', parseFloat(e.target.value));
  });
  
  // Radius slider
  const radiusSlider = document.getElementById('radius-slider');
  radiusSlider.addEventListener('input', (e) => {
    heatmap.set('radius', parseInt(e.target.value));
  });
  
  // Department filter
  const departmentFilter = document.getElementById('department-filter');
  departmentFilter.addEventListener('change', (e) => {
    const selectedDept = e.target.value;
    
    let filteredPoints = heatMapPoints;
    if (selectedDept !== 'all') {
      filteredPoints = heatMapPoints.filter(
        point => point.employee.department === selectedDept
      );
    }
    
    // Update heat map data
    const filteredData = filteredPoints.map(point => ({
      location: new google.maps.LatLng(point.lat, point.lng),
      weight: point.weight
    }));
    
    heatmap.setData(filteredData);
  });
}
```

### **Statistics Dashboard**
```javascript
// Display statistics in UI
function displayLocationStats(stats) {
  const statsContainer = document.getElementById('location-stats');
  
  const html = `
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Contacts</h3>
        <div class="stat-number">${stats.total}</div>
      </div>
      
      <div class="stat-card">
        <h3>Areas Covered</h3>
        <div class="stat-list">
          ${Object.entries(stats.byArea)
            .map(([area, count]) => `<div>${area}: ${count}</div>`)
            .join('')}
        </div>
      </div>
      
      <div class="stat-card">
        <h3>By Department</h3>
        <div class="stat-list">
          ${Object.entries(stats.byDepartment)
            .map(([dept, count]) => `<div>${dept}: ${count}</div>`)
            .join('')}
        </div>
      </div>
    </div>
  `;
  
  statsContainer.innerHTML = html;
}
```

---

## ⚡ **Performance Tips**

### **Caching Strategy**
```javascript
// Cache heat map data for better performance
class HeatMapCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl
    });
  }
}

// Usage
const heatMapCache = new HeatMapCache();

async function getCachedHeatMapData(enterpriseId) {
  const cacheKey = `heatmap_${enterpriseId}`;
  
  // Try cache first
  let heatMapPoints = heatMapCache.get(cacheKey);
  
  if (!heatMapPoints) {
    // Load from API
    heatMapPoints = await loadHeatMapData(enterpriseId);
    heatMapCache.set(cacheKey, heatMapPoints);
  }
  
  return heatMapPoints;
}
```

### **Lazy Loading**
```javascript
// Load heat map only when needed
function initializeLazyHeatMap(enterpriseId) {
  const mapContainer = document.getElementById('map');
  
  // Use Intersection Observer to load when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initializeHeatMap(enterpriseId);
        observer.unobserve(entry.target);
      }
    });
  });
  
  observer.observe(mapContainer);
}
```

---

## 🔧 **Error Handling**

```javascript
// Comprehensive error handling
async function safeLoadHeatMap(enterpriseId) {
  try {
    const heatMapPoints = await loadHeatMapData(enterpriseId);
    
    if (heatMapPoints.length === 0) {
      showNoDataMessage();
      return;
    }
    
    await initializeHeatMap(enterpriseId);
    
  } catch (error) {
    console.error('Heat map error:', error);
    showErrorMessage(error.message);
  }
}

function showNoDataMessage() {
  document.getElementById('map').innerHTML = `
    <div class="no-data-message">
      <h3>No Location Data Available</h3>
      <p>Contacts don't have location information yet.</p>
    </div>
  `;
}

function showErrorMessage(message) {
  document.getElementById('map').innerHTML = `
    <div class="error-message">
      <h3>Unable to Load Heat Map</h3>
      <p>${message}</p>
      <button onclick="location.reload()">Retry</button>
    </div>
  `;
}
```

---

## 🎯 **Complete Example**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Enterprise Contact Heat Map</title>
  <style>
    #map { height: 600px; width: 100%; }
    .controls { margin: 20px 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .stat-card { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="controls">
    <label>Intensity: <input type="range" id="intensity-slider" min="0" max="1" step="0.1" value="0.8"></label>
    <label>Radius: <input type="range" id="radius-slider" min="10" max="100" value="50"></label>
    <label>Department: 
      <select id="department-filter">
        <option value="all">All Departments</option>
        <option value="HR">HR</option>
        <option value="Marketing">Marketing</option>
        <option value="Exec">Executive</option>
      </select>
    </label>
  </div>
  
  <div id="map"></div>
  
  <div id="location-stats"></div>
  
  <script>
    // Your heat map initialization code here
    async function main() {
      const enterpriseId = 'x-spark-test';
      await safeLoadHeatMap(enterpriseId);
    }
    
    // Initialize when Google Maps loads
    window.initMap = main;
  </script>
  
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization&callback=initMap">
  </script>
</body>
</html>
```

---

## 📋 **Summary**

### **What You Need to Know:**
1. **✅ Endpoint Ready**: `/enterprise/{enterpriseId}/contacts/details`
2. **✅ Data Format**: All contacts have `location` objects with `latitude` and `longitude`
3. **✅ Coverage**: 100% of contacts have location data
4. **✅ Areas**: Contacts are distributed around 3 office locations in Gauteng, SA

### **What You Get:**
- **93 total contacts** with complete location data
- **Coordinates** for heat map visualization
- **Context data** (employee, department, company info)
- **Office locations** for reference points

### **Next Steps:**
1. Implement the `extractHeatMapPoints()` function
2. Initialize Google Maps with heat map layer
3. Add interactive features and controls
4. Style and customize based on your design system

**🌍 The backend is 100% ready for your heat map implementation!**
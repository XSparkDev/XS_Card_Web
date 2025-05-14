import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import "../../styles/Analytics.css";
import "../../styles/Dashboard.css";
import "../../styles/MetricCards.css";
import { 
  FaUsers, 
  FaIdCard, 
  FaLeaf, 
  FaChartArea, 
  FaChartLine, 
  FaCommentDots, 
  FaPalette,
  FaTree,
  FaTint,
  FaCloud,
  FaArrowUp
} from "react-icons/fa";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, API_BASE_URL } from "../../utils/api";
import { 
  calculatePaperSaved, 
  calculateWaterSaved, 
  calculateCO2Saved,
  calculateTreesSaved
} from "../../utils/environmentalImpact";
import EmployeeHeatmap from "./EmployeeHeatmap";

// User ID specifically for contacts - using the same ID as heatmap
const CONTACTS_USER_ID = "EccyMCv7uiS1eYHB3ZMu6zRR1DG2";

// Growth chart data point interface
interface GrowthDataPoint {
  date: string;
  totalContacts: number;
}

// Contact interface
interface Contact {
  createdAt?: string | { _seconds: number; _nanoseconds: number };
  [key: string]: any;
}

const Analytics = () => {
  const [activeCardsCount, setActiveCardsCount] = useState<number>(0);
  const [connectionsCount, setConnectionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionsLoading, setConnectionsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);
  
  // Contact growth states
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState<number>(0);
  const [growthLoading, setGrowthLoading] = useState<boolean>(true);

  // Fetch cards count
  useEffect(() => {
    const fetchCardsCount = async () => {
      try {
        setLoading(true);
        
        // Use the same API utility functions as in BusinessCards component
        const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CARDS);
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the response
        const responseData = await response.json();
        
        // Extract cards data from the response
        let cardsData = [];
        
        if (Array.isArray(responseData)) {
          cardsData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (Array.isArray(responseData.data)) {
            cardsData = responseData.data;
          } else if (Array.isArray(responseData.cards)) {
            cardsData = responseData.cards;
          } else {
            cardsData = [responseData];
          }
        }
        
        // Set the count of active cards
        setActiveCardsCount(cardsData.length);
        setError(null);
      } catch (err) {
        setError("Failed to fetch business cards data.");
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCardsCount();
  }, []);

  // Fetch connections count AND growth data
  useEffect(() => {
    const fetchConnectionsData = async () => {
      try {
        setConnectionsLoading(true);
        setGrowthLoading(true);
        
        // Use the same endpoint as the heatmap with specific user ID
        const url = `${API_BASE_URL}/Contacts/${CONTACTS_USER_ID}`;
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the response
        const responseData = await response.json();
        
        // Extract connections data from the response
        let contactsList = [];
        
        if (responseData && responseData.contactList && Array.isArray(responseData.contactList)) {
          contactsList = responseData.contactList;
        } else if (Array.isArray(responseData)) {
          contactsList = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (Array.isArray(responseData.data)) {
            contactsList = responseData.data;
          } else if (Array.isArray(responseData.contacts)) {
            contactsList = responseData.contacts;
          } else {
            // If the object itself contains the connection data
            contactsList = [responseData];
          }
        }
        
        // Set the count of connections
        setConnectionsCount(contactsList.length);
        setConnectionsError(null);
        
        // Process growth data
        processGrowthData(contactsList);
        
      } catch (err) {
        setConnectionsError("Failed to fetch connections data.");
        console.error("Error fetching connections:", err);
        // Generate sample growth data on error
        generateSampleGrowthData();
      } finally {
        setConnectionsLoading(false);
        setGrowthLoading(false);
      }
    };
    
    fetchConnectionsData();
  }, []);
  
  // Helper to extract date from contact
  const getDateFromContact = (contact: Contact): Date | null => {
    try {
      const createdAt = contact.createdAt;
      
      if (!createdAt) return null;
      
      // Handle Firebase timestamp
      if (typeof createdAt === 'object' && '_seconds' in createdAt) {
        return new Date(createdAt._seconds * 1000);
      }
      
      // Handle string date with manual parsing
      if (typeof createdAt === 'string') {
        // Parse the date manually from format like "May 13 2025 at at 4:18:25 PM GMT+2"
        try {
          // Extract date components
          const parts = createdAt.replace('at at', 'at').split(' at ');
          if (parts.length < 2) return null;
          
          const datePart = parts[0]; // "May 13 2025"
          const timePart = parts[1]; // "4:18:25 PM GMT+2"
          
          // Parse date components
          const dateComponents = datePart.split(' ');
          if (dateComponents.length !== 3) return null;
          
          const month = dateComponents[0]; // "May"
          const day = parseInt(dateComponents[1]); // "13"
          const year = parseInt(dateComponents[2]); // "2025"
          
          // Parse time components
          const timeWithoutTZ = timePart.split(' GMT')[0]; // "4:18:25 PM"
          const [time, period] = timeWithoutTZ.split(' '); // ["4:18:25", "PM"]
          const [hours, minutes, seconds] = time.split(':').map(Number);
          
          // Convert to 24 hour format if PM
          const adjustedHours = period === 'PM' && hours < 12 ? hours + 12 : hours;
          
          // Map month names to numbers
          const monthMap: Record<string, number> = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 'June': 5,
            'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
          };
          
          const monthIndex = monthMap[month];
          if (monthIndex === undefined) return null;
          
          // Create the date (month is 0-indexed in JavaScript)
          const date = new Date(year, monthIndex, day, adjustedHours, minutes, seconds);
          return date;
        } catch (e) {
          console.warn("Failed to parse date with custom parser:", e);
          return null;
        }
      }
      
      return null;
    } catch (e) {
      console.warn("Failed to parse date:", e);
      return null;
    }
  };
  
  // Process contact data for growth chart
  const processGrowthData = (contacts: Contact[]) => {
    if (!contacts || contacts.length === 0) {
      // Set empty data and zero growth instead of generating fake data
      setGrowthData([]);
      setGrowthPercentage(0);
      return;
    }
    
    try {
      console.log("Processing", contacts.length, "contacts for growth data");
      
      // Sort contacts by creation date
      const sortedContacts = [...contacts].sort((a, b) => {
        // Try to parse dates
        const dateA = getDateFromContact(a);
        const dateB = getDateFromContact(b);
        
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
      
      // Group by month
      const monthlyData: Record<string, number> = {};
      let total = 0;
      
      // For debugging
      const monthCounts: Record<string, number> = {};
      
      sortedContacts.forEach(contact => {
        const date = getDateFromContact(contact);
        if (!date) return;
        
        // Format month
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        // Count contacts by month
        if (!monthCounts[monthYear]) {
          monthCounts[monthYear] = 1;
        } else {
          monthCounts[monthYear]++;
        }
        
        // Increment total for running total
        total++;
        
        // Store running total
        monthlyData[monthYear] = total;
      });
      
      // Debug output
      console.log("Contacts by month:", monthCounts);
      console.log("Running totals:", monthlyData);
      
      // Convert to array for chart and growth calculation
      const chartData = Object.keys(monthlyData).map(month => ({
        date: month,
        totalContacts: monthlyData[month]
      }));
      
      // Take last 6 months and sort chronologically
      const recentData = chartData.slice(-6).sort((a, b) => {
        // Parse the month strings for proper chronological sorting
        const monthA = new Date(a.date);
        const monthB = new Date(b.date);
        return monthA.getTime() - monthB.getTime();
      });
      
      console.log("Recent data for growth calculation:", recentData);
      setGrowthData(recentData);
      
      // Calculate growth percentage
      if (recentData.length >= 2) {
        const latest = recentData[recentData.length - 1].totalContacts;
        const previous = recentData[recentData.length - 2].totalContacts;
        
        // Log values for debugging
        console.log(`Growth calculation: (${latest} - ${previous}) / ${previous} * 100`);
        
        const growth = ((latest - previous) / previous) * 100;
        const roundedGrowth = Math.round(growth * 10) / 10;
        
        console.log("Growth percentage:", roundedGrowth);
        setGrowthPercentage(roundedGrowth);
      } else {
        console.log("Not enough months to calculate growth");
        setGrowthPercentage(0);
      }
    } catch (err) {
      console.error("Error processing growth data:", err);
      // Set empty data and zero growth
      setGrowthData([]);
      setGrowthPercentage(0);
    }
  };
  
  // Replace sample data generator with a no-op function
  const generateSampleGrowthData = () => {
    setGrowthData([]);
    setGrowthPercentage(0);
  };

  // Calculate environmental impact metrics
  const paperSavedKg = calculatePaperSaved(connectionsCount);
  const waterSavedLitres = calculateWaterSaved(paperSavedKg);
  const co2SavedKg = calculateCO2Saved(paperSavedKg);
  const treesSaved = calculateTreesSaved(paperSavedKg);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-description">Monitor your business card engagement and environmental impact</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Total Connections</div>
              <div className="metric-icon-container blue">
                <FaUsers />
              </div>
            </div>
            <div className="metric-value">{connectionsLoading ? "Loading..." : connectionsCount}</div>
            <div className="metric-change positive">
              <span className="arrow">↑</span> 12.5% increase
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Active Cards</div>
              <div className="metric-icon-container purple">
                <FaIdCard />
              </div>
            </div>
            <div className="metric-value">{loading ? "Loading..." : activeCardsCount}</div>
            <div className="metric-change positive">
              <span className="arrow">↑</span> 8.3% increase
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Paper Saved</div>
              <div className="metric-icon-container green">
                <FaLeaf />
              </div>
            </div>
            <div className="metric-value">{connectionsLoading ? "Loading..." : `${paperSavedKg} kg`}</div>
            <div className="metric-change positive">
              <span className="arrow">↑</span> 15.2% increase
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Connection Growth</div>
              <div className="metric-icon-container green">
                <FaArrowUp />
              </div>
            </div>
            <div className="metric-value">
              {growthLoading ? "Loading..." : `${Math.abs(growthPercentage)}%`}
            </div>
            <div className={`metric-change ${growthPercentage >= 0 ? 'positive' : 'negative'}`}>
              <span className="arrow">{growthPercentage >= 0 ? '↑' : '↓'}</span> 
              {growthPercentage >= 0 ? 'increase' : 'decrease'} from previous period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="analytics-grid">
        {/* Heat Map */}
        <Card className="heatmap-card">
          <CardHeader>
            <CardTitle>Employee Networking Heat-map</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeHeatmap />
          </CardContent>
        </Card>

        {/* Engagement Analytics Section */}
        <div className="engagement-section">
          <div className="section-header">
            <h2 className="section-title">Engagement Analytics</h2>
          </div>
          
          <div className="charts-grid">
            <Card className="chart-card">
              <CardHeader>
                <CardTitle className="chart-title">
                  <FaChartArea className="chart-icon" /> Landing Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container area-chart">
                  {/* Placeholder for area chart */}
                </div>
              </CardContent>
            </Card>

            <Card className="chart-card">
              <CardHeader>
                <CardTitle className="chart-title">
                  <FaChartLine className="chart-icon" /> Connection Growth Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container line-chart">
                  {/* Placeholder for line chart */}
                </div>
              </CardContent>
            </Card>

            <Card className="chart-card">
              <CardHeader>
                <CardTitle className="chart-title">
                  <FaCommentDots className="chart-icon" /> Mention Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container donut-chart">
                  {/* Placeholder for donut chart */}
                </div>
              </CardContent>
            </Card>

            <Card className="chart-card">
              <CardHeader>
                <CardTitle className="chart-title">
                  <FaPalette className="chart-icon" /> Design Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container area-chart">
                  {/* Placeholder for area chart */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="bottom-grid">
        {/* CRM Integration */}
        <Card className="crm-card">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>CRM Integration</CardTitle>
            <button className="export-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export</span>
            </button>
          </CardHeader>
          <CardContent>
            <div className="crm-integration">
              <div className="crm-item">
                <div className="crm-logo salesforce">
                  <span>SF</span>
                </div>
                <div className="crm-info">
                  <span className="crm-name">Salesforce</span>
                </div>
                <div className="crm-status">
                  <span className="status-badge connected">Connected</span>
                </div>
              </div>
              
              <div className="crm-item">
                <div className="crm-logo hubspot" style={{ backgroundColor: "#ff7a59", color: "white" }}>
                  <span>H</span>
                </div>
                <div className="crm-info">
                  <span className="crm-name">HubSpot</span>
                </div>
                <div className="crm-status">
                  <span className="status-badge connected">Connected</span>
                </div>
              </div>
              
              <div className="crm-item">
                <div className="crm-logo microsoft" style={{ backgroundColor: "#0078d4", color: "white" }}>
                  <span>MD</span>
                </div>
                <div className="crm-info">
                  <span className="crm-name">Microsoft Dynamics</span>
                </div>
                <div className="crm-status">
                  <button className="connect-button">Connect</button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card className="environmental-card">
          <CardHeader>
            <CardTitle>Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="environmental-impact-grid">
              <div className="impact-box trees-box">
                <div className="impact-content">
                  <div className="impact-title">Trees Saved</div>
                  <div className="impact-value trees-value">
                    {connectionsLoading ? "Loading..." : treesSaved}
                  </div>
                </div>
                <div className="impact-icon-container">
                  <FaTree className="impact-icon" />
                </div>
              </div>
              
              <div className="impact-box water-box">
                <div className="impact-content">
                  <div className="impact-title">Water Saved</div>
                  <div className="impact-value water-value">
                    {connectionsLoading ? "Loading..." : `${waterSavedLitres}L`}
                  </div>
                </div>
                <div className="impact-icon-container">
                  <FaTint className="impact-icon" />
                </div>
              </div>
              
              <div className="impact-box co2-box">
                <div className="impact-content">
                  <div className="impact-title">CO<sub>2</sub> Reduced</div>
                  <div className="impact-value co2-value">
                    {connectionsLoading ? "Loading..." : `${co2SavedKg} kg`}
                  </div>
                </div>
                <div className="impact-icon-container">
                  <FaCloud className="impact-icon" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;


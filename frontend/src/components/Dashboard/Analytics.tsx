import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import "../../styles/Analytics.css";
import "../../styles/Dashboard.css";
import "../../styles/MetricCards.css";
import { 
  FaUsers, 
  FaIdCard, 
  FaLeaf, 
  FaRobot, 
  FaChartArea, 
  FaChartLine, 
  FaCommentDots, 
  FaPalette,
  FaTree,
  FaTint,
  FaCloud,
  FaFire
} from "react-icons/fa";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders } from "../../utils/api";
import { 
  calculatePaperSaved, 
  calculateWaterSaved, 
  calculateCO2Saved,
  calculateTreesSaved
} from "../../utils/environmentalImpact";

const Analytics = () => {
  const [activeCardsCount, setActiveCardsCount] = useState<number>(0);
  const [connectionsCount, setConnectionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionsLoading, setConnectionsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);

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

  // Fetch connections count
  useEffect(() => {
    const fetchConnectionsCount = async () => {
      try {
        setConnectionsLoading(true);
        
        // Create URL for the Contacts endpoint
        const baseUrl = buildEnterpriseUrl("").replace(/\/enterprise.*$/, "");
        const url = `${baseUrl}/Contacts`;
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the response
        const responseData = await response.json();
        
        // Extract connections data from the response
        let connectionsData = [];
        
        if (Array.isArray(responseData)) {
          connectionsData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (Array.isArray(responseData.data)) {
            connectionsData = responseData.data;
          } else if (Array.isArray(responseData.contacts)) {
            connectionsData = responseData.contacts;
          } else {
            // If the object itself contains the connection data
            connectionsData = [responseData];
          }
        }
        
        // Set the count of connections
        setConnectionsCount(connectionsData.length);
        setConnectionsError(null);
      } catch (err) {
        setConnectionsError("Failed to fetch connections data.");
        console.error("Error fetching connections:", err);
      } finally {
        setConnectionsLoading(false);
      }
    };
    
    fetchConnectionsCount();
  }, []);

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
              <div className="metric-label">AI Insights</div>
              <div className="metric-icon-container orange">
                <FaFire />
              </div>
            </div>
            <div className="metric-value">89%</div>
            <div className="metric-change positive">
              <span className="arrow">↑</span> 5.7% increase
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
            <div className="heatmap-container">
              <div className="placeholder-heatmap">
                <p>Interactive Heat Map</p>
              </div>
            </div>
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
                  <FaChartLine className="chart-icon" /> User Analytics
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

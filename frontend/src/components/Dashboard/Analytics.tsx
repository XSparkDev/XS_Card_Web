import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import "../../styles/Analytics.css";
import "../../styles/Dashboard.css";
import { FaUsers, FaIdCard, FaLeaf, FaRobot, FaChartArea, FaChartLine, FaCommentDots, FaPalette } from "react-icons/fa";

const Analytics = () => {
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
          <CardContent>
            <div className="metric-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
              <FaUsers />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Connections</p>
              <h2 className="metric-value">2,847</h2>
              <p className="metric-change positive">
                <span className="arrow">↑</span> 12.3% increase
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent>
            <div className="metric-icon" style={{ backgroundColor: "rgba(168, 85, 247, 0.1)" }}>
              <FaIdCard />
            </div>
            <div className="metric-content">
              <p className="metric-label">Active Cards</p>
              <h2 className="metric-value">456</h2>
              <p className="metric-change positive">
                <span className="arrow">↑</span> 8.3% increase
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent>
            <div className="metric-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
              <FaLeaf />
            </div>
            <div className="metric-content">
              <p className="metric-label">Paper Saved</p>
              <h2 className="metric-value">1,234 kg</h2>
              <p className="metric-change positive">
                <span className="arrow">↑</span> 15.2% increase
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent>
            <div className="metric-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
              <FaRobot />
            </div>
            <div className="metric-content">
              <p className="metric-label">AI Insights</p>
              <h2 className="metric-value">89%</h2>
              <p className="metric-change positive">
                <span className="arrow">↑</span> 5.7% increase
              </p>
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
                  <div className="impact-value trees-value">47</div>
                </div>
                <div className="impact-check-container">
                  <div className="impact-check">✓</div>
                </div>
              </div>
              
              <div className="impact-box water-box">
                <div className="impact-content">
                  <div className="impact-title">Water Saved</div>
                  <div className="impact-value water-value">2,890L</div>
                </div>
                <div className="impact-check-container">
                  <div className="impact-check">✓</div>
                </div>
              </div>
              
              <div className="impact-box co2-box">
                <div className="impact-content">
                  <div className="impact-title">CO<sub>2</sub> Reduced</div>
                  <div className="impact-value co2-value">1.2 tons</div>
                </div>
                <div className="impact-check-container">
                  <div className="impact-check">✓</div>
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

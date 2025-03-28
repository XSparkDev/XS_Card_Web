import { FaArrowUp, FaCheck, FaFileDownload, FaPeopleArrows, FaCreditCard, FaLeaf, FaBrain, FaCloud, FaBuilding, FaThLarge } from "react-icons/fa";
import { Card, CardContent } from "../UI/card";
import { Button } from "../UI/button";
import "../../styles/Analytics.css";

// Mock data for charts
const mockData = {
  totalConnections: {
    value: "2,847",
    percentage: 12.5,
    icon: "people"
  },
  activeCards: {
    value: "456",
    percentage: 8.3,
    icon: "credit-card"
  },
  paperSaved: {
    value: "1,234 kg",
    percentage: 15.2,
    icon: "eco"
  },
  aiInsights: {
    value: "89%",
    percentage: 5.7,
    icon: "psychology"
  },
  crmIntegrations: [
    { name: "Salesforce", icon: "cloud", status: "Connected" },
    { name: "HubSpot", icon: "apps", status: "Connected" },
    { name: "Microsoft Dynamics", icon: "business", status: "Connect" }
  ],
  environmentalImpact: {
    treesSaved: 47,
    waterSaved: "2,890L",
    co2Reduced: "1.2 tons"
  }
};

// Get icon component based on name
const getIconComponent = (iconName: string) => {
  switch(iconName) {
    case 'people': return <FaPeopleArrows />;
    case 'credit-card': return <FaCreditCard />;
    case 'eco': return <FaLeaf />;
    case 'psychology': return <FaBrain />;
    case 'cloud': return <FaCloud />;
    case 'apps': return <FaThLarge />;
    case 'business': return <FaBuilding />;
    default: return <FaThLarge />;
  }
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  percentage, 
  icon,
  bgColor 
}: { 
  title: string; 
  value: string; 
  percentage: number; 
  icon: string;
  bgColor: string;
}) => (
  <Card className="stat-card">
    <CardContent>
      <div className="stat-card-content">
        <div>
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value">{value}</p>
          <div className="stat-card-percentage">
            <FaArrowUp className="percentage-icon" />
            <span className="percentage-text">{percentage}% increase</span>
          </div>
        </div>
        <div className="icon-container" style={{ backgroundColor: bgColor }}>
          {getIconComponent(icon)}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Environmental Impact Card
const EnvironmentalImpactCard = ({ 
  title, 
  value, 
  bgColor,
  textColor
}: { 
  title: string; 
  value: string | number; 
  bgColor: string;
  textColor: string;
}) => (
  <div className="environmental-card" style={{ backgroundColor: bgColor }}>
    <div className="environmental-card-content">
      <div>
        <p className="environmental-card-title" style={{ color: textColor }}>{title}</p>
        <p className="environmental-card-value" style={{ color: textColor }}>{value}</p>
      </div>
      <div style={{ opacity: 0.8 }}>
        <FaCheck color={textColor} />
      </div>
    </div>
  </div>
);

// CRM Integration Item
const CRMIntegrationItem = ({ 
  name, 
  icon, 
  status 
}: { 
  name: string; 
  icon: string; 
  status: string;
}) => (
  <div className="crm-item">
    <div className="crm-item-left">
      <div className="crm-icon-container" style={{ 
        backgroundColor: name === "Salesforce" ? "#e6f0ff" : 
                         name === "HubSpot" ? "#fff0e6" : "#f0f0f0" 
      }}>
        {getIconComponent(icon)}
      </div>
      <p className="crm-name">{name}</p>
    </div>
    {status === "Connect" ? (
      <button className="connect-button">Connect</button>
    ) : (
      <span className="connected-status">Connected</span>
    )}
  </div>
);

const Analytics = () => {
  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics Dashboard</h1>
        <p className="analytics-subtitle">Track your business card performance and networking insights</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card-wrapper">
          <StatCard 
            title="Total Connections" 
            value={mockData.totalConnections.value} 
            percentage={mockData.totalConnections.percentage} 
            icon={mockData.totalConnections.icon}
            bgColor="#e6f0ff" 
          />
        </div>
        <div className="stat-card-wrapper">
          <StatCard 
            title="Active Cards" 
            value={mockData.activeCards.value} 
            percentage={mockData.activeCards.percentage} 
            icon={mockData.activeCards.icon}
            bgColor="#f0e6ff"
          />
        </div>
        <div className="stat-card-wrapper">
          <StatCard 
            title="Paper Saved" 
            value={mockData.paperSaved.value} 
            percentage={mockData.paperSaved.percentage} 
            icon={mockData.paperSaved.icon}
            bgColor="#e6fff0"
          />
        </div>
        <div className="stat-card-wrapper">
          <StatCard 
            title="AI Insights" 
            value={mockData.aiInsights.value} 
            percentage={mockData.aiInsights.percentage} 
            icon={mockData.aiInsights.icon}
            bgColor="#fff0e6"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="charts-row">
          {/* Employee Networking Heat-map */}
          <Card className="chart-card half-width-card">
            <CardContent>
              <h3 className="chart-title">Employee Networking Heat-map</h3>
              <div className="heatmap-container">
                <div className="heatmap-overlay">
                  <p className="heatmap-text">Interactive Heat Map</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Analytics */}
          <Card className="chart-card half-width-card">
            <CardContent>
              <h3 className="chart-title">Engagement Analytics</h3>
              <div className="engagement-grid">
                <div className="engagement-chart">
                  <p className="engagement-chart-title">Landing Stats</p>
                  <div className="chart-placeholder">
                    <div className="area-chart-placeholder">
                      <div className="area-chart-gradient"></div>
                      <div className="area-chart-line"></div>
                    </div>
                  </div>
                </div>
                <div className="engagement-chart">
                  <p className="engagement-chart-title">User Analytics</p>
                  <div className="chart-placeholder">
                    <div className="line-chart-placeholder">
                      <div className="line-chart-line"></div>
                      <div className="line-chart-dot"></div>
                    </div>
                  </div>
                </div>
                <div className="engagement-chart">
                  <p className="engagement-chart-title">Mention Tools</p>
                  <div className="chart-placeholder">
                    <div className="pie-chart-placeholder"></div>
                  </div>
                </div>
                <div className="engagement-chart">
                  <p className="engagement-chart-title">Design Cards</p>
                  <div className="chart-placeholder">
                    <div className="area-chart-placeholder"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Cards - CRM Integration and Environmental Impact side by side */}
      <div className="bottom-grid">
        <div className="charts-row">
          {/* CRM Integration */}
          <Card className="bottom-card half-width-card">
            <CardContent>
              <div className="card-header">
                <h3 className="chart-title">CRM Integration</h3>
                <Button 
                  variant="outline" 
                  className="export-button"
                  leftIcon={<FaFileDownload />}
                >
                  Export
                </Button>
              </div>
              <div className="crm-list">
                {mockData.crmIntegrations.map((item, index) => (
                  <CRMIntegrationItem 
                    key={index}
                    name={item.name} 
                    icon={item.icon} 
                    status={item.status} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card className="bottom-card half-width-card">
            <CardContent>
              <h3 className="chart-title">Environmental Impact</h3>
              <div className="environmental-grid">
                <EnvironmentalImpactCard 
                  title="Trees Saved"
                  value={mockData.environmentalImpact.treesSaved}
                  bgColor="#e6fff0"
                  textColor="#10b981"
                />
                <EnvironmentalImpactCard 
                  title="Water Saved"
                  value={mockData.environmentalImpact.waterSaved}
                  bgColor="#e6f0ff"
                  textColor="#3b82f6"
                />
                <EnvironmentalImpactCard 
                  title="CO₂ Reduced"
                  value={mockData.environmentalImpact.co2Reduced}
                  bgColor="#f0e6ff"
                  textColor="#8b5cf6"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

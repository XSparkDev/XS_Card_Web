import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../UI/card";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Badge } from "../UI/badge";
import { Switch } from "../UI/switch";
import "../../styles/Integrations.css";

// Import icons from react-icons
import { 
  FaSearch, FaLink, FaExternalLinkAlt, FaFileAlt, FaCodeBranch, 
  FaDatabase, FaCreditCard, FaEnvelope, FaCloud, FaCog, FaRedo, 
  FaCommentAlt, FaPlus
} from "react-icons/fa";

const integrations = [
  {
    id: 1,
    name: "CRM Integration",
    description: "Connect to popular CRM platforms",
    icon: <FaDatabase className="integration-icon crm-icon" />,
    status: "Connected",
    connections: ["Salesforce", "HubSpot"],
    category: "data"
  },
  {
    id: 2,
    name: "Payment Gateway",
    description: "Process payments directly from cards",
    icon: <FaCreditCard className="integration-icon payment-icon" />,
    status: "Not Connected",
    connections: [],
    category: "payment"
  },
  {
    id: 3,
    name: "Email Marketing",
    description: "Connect with email marketing tools",
    icon: <FaEnvelope className="integration-icon email-icon" />,
    status: "Connected",
    connections: ["Mailchimp"],
    category: "marketing"
  },
  {
    id: 4,
    name: "Cloud Storage",
    description: "Sync with your cloud storage",
    icon: <FaCloud className="integration-icon cloud-icon" />,
    status: "Connected",
    connections: ["Google Drive", "Dropbox"],
    category: "storage"
  },
  {
    id: 5,
    name: "Social Media",
    description: "Share cards on social platforms",
    icon: <FaCommentAlt className="integration-icon social-icon" />,
    status: "Not Connected",
    connections: [],
    category: "marketing"
  },
  {
    id: 6,
    name: "Document Management",
    description: "Integrate with document services",
    icon: <FaFileAlt className="integration-icon document-icon" />,
    status: "Connected",
    connections: ["DocuSign"],
    category: "document"
  },
  {
    id: 7,
    name: "Version Control",
    description: "Sync card changes with Git",
    icon: <FaCodeBranch className="integration-icon git-icon" />,
    status: "Not Connected",
    connections: [],
    category: "development"
  }
];

const Integrations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [syncStatus, setSyncStatus] = useState<Record<number, boolean>>({});

  const handleToggleIntegration = (id: number) => {
    setSyncStatus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || 
                        (filter === "connected" && integration.status === "Connected") ||
                        (filter === "not-connected" && integration.status === "Not Connected") ||
                        filter === integration.category;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="integrations-container">
      <div className="integrations-header">
        <div>
          <h1 className="integrations-title">Integrations</h1>
          <p className="integrations-description">Connect XSCard with your favorite tools and services</p>
        </div>
        <Button className="add-integration-button">
          <FaPlus className="icon-small mr-2" />
          Add New Integration
        </Button>
      </div>

      <div className="integrations-content">
        <div className="integrations-sidebar">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <Input
              placeholder="Search integrations..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Card className="categories-card">
            <CardHeader className="categories-header">
              <CardTitle className="categories-title">Categories</CardTitle>
            </CardHeader>
            <CardContent className="categories-content">
              <button
                className={`category-button ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Integrations
              </button>
              <button
                className={`category-button ${filter === "connected" ? "active" : ""}`}
                onClick={() => setFilter("connected")}
              >
                Connected
              </button>
              <button
                className={`category-button ${filter === "not-connected" ? "active" : ""}`}
                onClick={() => setFilter("not-connected")}
              >
                Not Connected
              </button>
              <hr className="category-divider" />
              <button
                className={`category-button ${filter === "data" ? "active" : ""}`}
                onClick={() => setFilter("data")}
              >
                Data & CRM
              </button>
              <button
                className={`category-button ${filter === "payment" ? "active" : ""}`}
                onClick={() => setFilter("payment")}
              >
                Payment Solutions
              </button>
              <button
                className={`category-button ${filter === "marketing" ? "active" : ""}`}
                onClick={() => setFilter("marketing")}
              >
                Marketing & Social
              </button>
              <button
                className={`category-button ${filter === "document" ? "active" : ""}`}
                onClick={() => setFilter("document")}
              >
                Document Management
              </button>
              <button
                className={`category-button ${filter === "storage" ? "active" : ""}`}
                onClick={() => setFilter("storage")}
              >
                Storage & Cloud
              </button>
              <button
                className={`category-button ${filter === "development" ? "active" : ""}`}
                onClick={() => setFilter("development")}
              >
                Development Tools
              </button>
            </CardContent>
          </Card>
          
          <Card className="api-card">
            <CardHeader className="api-header">
              <CardTitle className="api-title">API Access</CardTitle>
            </CardHeader>
            <CardContent className="api-content">
              <div className="api-key-container">
                <p className="api-key-label">Your API Key:</p>
                <div className="api-key-input-container">
                  <Input type="password" value="*************************" readOnly />
                  <Button variant="outline" size="sm" className="api-refresh-button">
                    <FaRedo className="icon-small" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="api-manage-button">
                <FaCog className="icon-small mr-2" />
                Manage API Settings
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="integrations-main">
          <div className="integrations-grid">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="integration-card">
                <CardHeader className="integration-header">
                  <div className="integration-header-content">
                    <div className="integration-icon-container">
                      {integration.icon}
                    </div>
                    <div className="integration-title-container">
                      <CardTitle className="integration-title">{integration.name}</CardTitle>
                    </div>
                    <Badge 
                      variant={integration.status === "Connected" ? "default" : "outline"} 
                      className="integration-badge"
                    >
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="integration-content">
                  <p className="integration-description">{integration.description}</p>
                  {integration.connections.length > 0 ? (
                    <div className="connected-accounts">
                      <p className="connected-accounts-label">Connected accounts:</p>
                      <div className="connected-accounts-badges">
                        {integration.connections.map((connection) => (
                          <Badge key={connection} variant="secondary" className="connection-badge">
                            {connection}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="integration-footer">
                    <div className="integration-toggle">
                      <Switch 
                        checked={integration.status === "Connected" || syncStatus[integration.id]} 
                        onChange={() => handleToggleIntegration(integration.id)}
                      />
                      <span className="toggle-label">
                        {integration.status === "Connected" || syncStatus[integration.id] ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <Button variant="ghost" className="configure-button">
                      <FaExternalLinkAlt className="icon-small" />
                      <span className="sr-only">Configure</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="no-results">
              <p>No integrations found. Try adjusting your search or filters.</p>
            </div>
          )}
          
          <Card className="developer-card">
            <CardHeader className="developer-header">
              <CardTitle>Developer Resources</CardTitle>
              <CardDescription>Resources for custom integration development</CardDescription>
            </CardHeader>
            <CardContent className="developer-resources">
              <div className="resource-card">
                <h3 className="resource-title">API Documentation</h3>
                <p className="resource-description">Complete API reference for developers</p>
                <Button variant="outline" className="resource-button">
                  <FaExternalLinkAlt className="icon-small mr-2" />
                  View Docs
                </Button>
              </div>
              <div className="resource-card">
                <h3 className="resource-title">Webhook Setup</h3>
                <p className="resource-description">Configure real-time data webhooks</p>
                <Button variant="outline" className="resource-button">
                  <FaLink className="icon-small mr-2" />
                  Configure
                </Button>
              </div>
              <div className="resource-card">
                <h3 className="resource-title">SDK Downloads</h3>
                <p className="resource-description">Download SDKs for popular languages</p>
                <Button variant="outline" className="resource-button">
                  <FaCloud className="icon-small mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Integrations;

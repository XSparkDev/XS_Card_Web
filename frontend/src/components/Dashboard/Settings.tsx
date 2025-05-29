import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../UI/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Switch } from "../UI/switch";
import { Label } from "../UI/label";
import { Badge } from "../UI/badge";
import { Select } from "../UI/select";
import "../../styles/Settings.css";

// Import icons from react-icons
import { 
  FaBuilding, FaCreditCard, FaPalette, FaBell, 
  FaCheck, FaDownload, FaShieldAlt, FaExclamationTriangle
} from "react-icons/fa";

// Import API utilities
import { 
  ENDPOINTS, 
  buildEnterpriseUrl, 
  getEnterpriseHeaders, 
  DEFAULT_ENTERPRISE_ID 
} from "../../utils/api";

// Import useNavigate from react-router-dom if you're using React Router
import { useNavigate } from "react-router-dom";

// Define interface for enterprise data
interface EnterpriseData {
  id: string;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  colorScheme?: string;
  companySize?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

const Settings = () => {
  // Add navigate function if using React Router
  const navigate = useNavigate();
  
  // Add a function to handle navigation to pricing page
  const goToPricing = () => {
    navigate("/pricing");
  };

  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData>({
    id: DEFAULT_ENTERPRISE_ID,
    name: "",
    description: "",
    industry: "Technology",
    website: "",
    logoUrl: "",
    colorScheme: "#1B2B5B",
    companySize: "unknown",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    mentions: true,
    teamUpdates: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    fontSize: "medium",
    compactView: false
  });

  // Add this type to specify valid notification setting keys
  type NotificationSettingKey = keyof typeof notificationSettings;

  // Fetch enterprise data on component mount
  useEffect(() => {
    const fetchEnterpriseData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const enterpriseId = localStorage.getItem('enterpriseId') || DEFAULT_ENTERPRISE_ID;
        const url = buildEnterpriseUrl(ENDPOINTS.GET_ENTERPRISE.replace(':enterpriseId', enterpriseId));
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, {
          method: 'GET',
          headers
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch enterprise data');
        }
        
        const data = await response.json();
        
        if (data.enterprise) {
          setEnterpriseData({
            id: data.enterprise.id,
            name: data.enterprise.name || "",
            description: data.enterprise.description || "",
            industry: data.enterprise.industry || "Technology",
            website: data.enterprise.website || "",
            logoUrl: data.enterprise.logoUrl || "",
            colorScheme: data.enterprise.colorScheme || "#1B2B5B",
            companySize: data.enterprise.companySize || "unknown",
            address: data.enterprise.address || {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: ""
            }
          });
        }
      } catch (err) {
        console.error('Error fetching enterprise data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load enterprise data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnterpriseData();
  }, []);

  const handleEnterpriseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEnterpriseData({
        ...enterpriseData,
        address: {
          ...enterpriseData.address,
          [addressField]: value
        }
      });
    } else {
      setEnterpriseData({
        ...enterpriseData,
        [name]: value
      });
    }
  };

  const handleSaveEnterprise = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const enterpriseId = enterpriseData.id || DEFAULT_ENTERPRISE_ID;
      const url = buildEnterpriseUrl(ENDPOINTS.UPDATE_ENTERPRISE.replace(':enterpriseId', enterpriseId));
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: enterpriseData.name,
          description: enterpriseData.description,
          industry: enterpriseData.industry,
          website: enterpriseData.website,
          logoUrl: enterpriseData.logoUrl,
          colorScheme: enterpriseData.colorScheme,
          companySize: enterpriseData.companySize,
          address: enterpriseData.address
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update enterprise data');
      }
      
      const data = await response.json();
      
      if (data.enterprise) {
        setEnterpriseData({
          id: data.enterprise.id,
          name: data.enterprise.name || "",
          description: data.enterprise.description || "",
          industry: data.enterprise.industry || "Technology",
          website: data.enterprise.website || "",
          logoUrl: data.enterprise.logoUrl || "",
          colorScheme: data.enterprise.colorScheme || "#1B2B5B",
          companySize: data.enterprise.companySize || "unknown",
          address: data.enterprise.address || enterpriseData.address
        });
      }
      
      setSuccessMessage('Enterprise settings updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving enterprise data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save enterprise data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotification = (setting: NotificationSettingKey) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-description">Manage your organization settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="settings-tabs">
        <TabsList className="settings-tabs-list">
          <TabsTrigger value="profile" className="settings-tab">
            <FaBuilding className="tab-icon" />
            <span className="tab-text">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="settings-tab">
            <FaCreditCard className="tab-icon" />
            <span className="tab-text">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="settings-tab">
            <FaBell className="tab-icon" />
            <span className="tab-text">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="settings-tab">
            <FaPalette className="tab-icon" />
            <span className="tab-text">Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="settings-tab-content">
          {isLoading ? (
            <Card className="profile-card">
              <CardContent className="p-8">
                <div className="text-center">Loading organization data...</div>
              </CardContent>
            </Card>
          ) : (
            <Card className="profile-card">
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>
                  Manage your organization information and branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="error-message mb-4">
                    <FaExclamationTriangle className="mr-2" />
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="success-message mb-4">
                    <FaCheck className="mr-2" />
                    {successMessage}
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={enterpriseData.name} 
                      onChange={handleEnterpriseChange} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      options={[
                        { value: "Technology", label: "Technology" },
                        { value: "Finance", label: "Finance" },
                        { value: "Healthcare", label: "Healthcare" },
                        { value: "Education", label: "Education" },
                        { value: "Retail", label: "Retail" }
                      ]}
                      value={enterpriseData.industry}
                      onChange={(e) => setEnterpriseData({...enterpriseData, industry: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select 
                      options={[
                        { value: "1-10", label: "1-10 employees" },
                        { value: "11-50", label: "11-50 employees" },
                        { value: "50-100", label: "50-100 employees" },
                        { value: "101-500", label: "101-500 employees" },
                        { value: "501+", label: "501+ employees" },
                        { value: "unknown", label: "Not specified" }
                      ]}
                      value={enterpriseData.companySize}
                      onChange={(e) => setEnterpriseData({...enterpriseData, companySize: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      name="website" 
                      value={enterpriseData.website} 
                      onChange={handleEnterpriseChange} 
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={enterpriseData.description} 
                    onChange={handleEnterpriseChange} 
                    rows={4}
                    className="bio-input" 
                    placeholder="Brief description of your organization"
                  />
                </div>
                
                <div className="address-section mt-6">
                  <h3 className="section-title">Organization Address</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <Label htmlFor="street">Street Address</Label>
                      <Input 
                        id="street" 
                        name="address.street" 
                        value={enterpriseData.address?.street || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="address.city" 
                        value={enterpriseData.address?.city || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="state">State/Province</Label>
                      <Input 
                        id="state" 
                        name="address.state" 
                        value={enterpriseData.address?.state || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        name="address.postalCode" 
                        value={enterpriseData.address?.postalCode || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        name="address.country" 
                        value={enterpriseData.address?.country || ''} 
                        onChange={handleEnterpriseChange} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="branding-section mt-6">
                  <h3 className="section-title">Organization Branding</h3>
                  <div className="branding-container">
                    <div className="logo-placeholder">
                      {enterpriseData.logoUrl ? (
                        <img src={enterpriseData.logoUrl} alt="Organization logo" className="logo-image" />
                      ) : (
                        <span>{enterpriseData.name ? enterpriseData.name.substring(0, 2).toUpperCase() : 'XS'}</span>
                      )}
                    </div>
                    <div className="logo-actions">
                      <Button size="sm" variant="outline" className="upload-button">Upload Logo</Button>
                      <p className="logo-hint">Recommended size: 512x512px</p>
                    </div>
                  </div>
                  
                  <div className="form-group mt-4">
                    <Label htmlFor="colorScheme">Brand Color</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        id="colorScheme" 
                        name="colorScheme" 
                        type="color" 
                        value={enterpriseData.colorScheme} 
                        onChange={handleEnterpriseChange} 
                        className="w-20 h-10"
                      />
                      <Input 
                        value={enterpriseData.colorScheme} 
                        onChange={handleEnterpriseChange}
                        name="colorScheme"
                        placeholder="#1B2B5B"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="form-actions">
                <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                <Button onClick={handleSaveEnterprise} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="billing" className="settings-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your billing information and subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="billing-content">
                <div className="current-plan">
                  <div className="plan-header">
                    <div>
                      <h3 className="plan-title">Enterprise Plan</h3>
                      <p className="plan-price">$499/month, billed annually</p>
                    </div>
                    <Badge>Current Plan</Badge>
                  </div>
                  <div className="plan-features">
                    <h4 className="features-title">Features:</h4>
                    <ul className="features-list">
                      <li className="feature-item">
                        <FaCheck className="feature-check" />
                        Unlimited business cards
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-check" />
                        Advanced analytics
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-check" />
                        Custom branding
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-check" />
                        Priority support
                      </li>
                      <li className="feature-item">
                        <FaCheck className="feature-check" />
                        All integrations
                      </li>
                    </ul>
                  </div>
                  <div className="plan-actions">
                    <Button size="sm">Manage Subscription</Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={goToPricing}
                    >
                      See All Plans
                    </Button>
                  </div>
                </div>
                
                <div className="payment-section">
                  <h3 className="section-title">Payment Method</h3>
                  <div className="payment-method">
                    <div className="payment-info">
                      <FaCreditCard className="payment-icon" />
                      <div className="card-details">
                        <p className="card-number">•••• •••• •••• 4242</p>
                        <p className="card-expiry">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Update</Button>
                  </div>
                </div>
                
                <div className="billing-history">
                  <h3 className="section-title">Billing History</h3>
                  <div className="invoice-list">
                    <div className="invoice-item">
                      <div className="invoice-info">
                        <p className="invoice-date">Jan 1, 2023</p>
                        <p className="invoice-number">Invoice #INV-001</p>
                      </div>
                      <div className="invoice-details">
                        <p className="invoice-amount">$499.00</p>
                        <div className="invoice-actions">
                          <Badge variant="outline" className="invoice-status">Paid</Badge>
                          <Button size="sm" variant="ghost" className="download-button">
                            <FaDownload className="download-icon" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="invoice-item">
                      <div className="invoice-info">
                        <p className="invoice-date">Dec 1, 2022</p>
                        <p className="invoice-number">Invoice #INV-002</p>
                      </div>
                      <div className="invoice-details">
                        <p className="invoice-amount">$499.00</p>
                        <div className="invoice-actions">
                          <Badge variant="outline" className="invoice-status">Paid</Badge>
                          <Button size="sm" variant="ghost" className="download-button">
                            <FaDownload className="download-icon" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add Pricing section */}
              <div className="pricing-section">
                <h3 className="section-title">Plans & Pricing</h3>
                <div className="pricing-link-container">
                  <div className="pricing-link-info">
                    <h4 className="pricing-link-title">View Available Plans</h4>
                    <p className="pricing-link-description">
                      Compare plans and pricing to find the right fit for your business
                    </p>
                  </div>
                  <Button 
                    variant="link" 
                    className="pricing-link"
                    onClick={goToPricing}
                  >
                    Pricing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="settings-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="notification-settings">
                <div className="notification-channel">
                  <div className="channel-info">
                    <h3 className="channel-title">Email Notifications</h3>
                    <p className="channel-description">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications} 
                    onChange={() => handleToggleNotification('emailNotifications')}
                  />
                </div>
                
                <div className="notification-channel">
                  <div className="channel-info">
                    <h3 className="channel-title">Push Notifications</h3>
                    <p className="channel-description">Receive updates via push notifications</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications} 
                    onChange={() => handleToggleNotification('pushNotifications')}
                  />
                </div>
                
                <div className="notification-types">
                  <h3 className="section-title">Notification Types</h3>
                  
                  <div className="notification-list">
                    <div className="notification-type">
                      <div className="type-info">
                        <p className="type-title">Weekly Digest</p>
                        <p className="type-description">Receive a summary of activities each week</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.weeklyDigest} 
                        onChange={() => handleToggleNotification('weeklyDigest')}
                      />
                    </div>
                    
                    <div className="notification-type">
                      <div className="type-info">
                        <p className="type-title">Mentions & Comments</p>
                        <p className="type-description">When someone mentions you or comments on your cards</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.mentions} 
                        onChange={() => handleToggleNotification('mentions')}
                      />
                    </div>
                    
                    <div className="notification-type">
                      <div className="type-info">
                        <p className="type-title">Team Updates</p>
                        <p className="type-description">When changes are made to your team or department</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.teamUpdates} 
                        onChange={() => handleToggleNotification('teamUpdates')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="settings-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="appearance-settings">
                <div className="theme-section">
                  <h3 className="section-title">Theme</h3>
                  <div className="theme-options">
                    <div className={`theme-option ${appearanceSettings.theme === 'light' ? 'selected' : ''}`}
                         onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'light'})}>
                      <div className="theme-preview light-theme"></div>
                      <p className="theme-label">Light</p>
                    </div>
                    <div className={`theme-option ${appearanceSettings.theme === 'dark' ? 'selected' : ''}`}
                         onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'dark'})}>
                      <div className="theme-preview dark-theme"></div>
                      <p className="theme-label">Dark</p>
                    </div>
                    <div className={`theme-option ${appearanceSettings.theme === 'system' ? 'selected' : ''}`}
                         onClick={() => setAppearanceSettings({...appearanceSettings, theme: 'system'})}>
                      <div className="theme-preview system-theme"></div>
                      <p className="theme-label">System</p>
                    </div>
                  </div>
                </div>
                
                <div className="font-size-section">
                  <h3 className="section-title">Font Size</h3>
                  <Select 
                    options={[
                      { value: "small", label: "Small" },
                      { value: "medium", label: "Medium" },
                      { value: "large", label: "Large" }
                    ]}
                    value={appearanceSettings.fontSize}
                    onChange={(e) => setAppearanceSettings({...appearanceSettings, fontSize: e.target.value})}
                    className="font-size-select"
                  />
                </div>
                
                <div className="compact-view-section">
                  <div className="view-info">
                    <h3 className="section-title">Compact View</h3>
                    <p className="view-description">Display more content with less spacing</p>
                  </div>
                  <Switch 
                    checked={appearanceSettings.compactView} 
                    onChange={() => setAppearanceSettings(
                      {...appearanceSettings, compactView: !appearanceSettings.compactView}
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

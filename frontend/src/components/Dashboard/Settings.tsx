import React, { useState } from "react";
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
  FaUser, FaBuilding, FaCreditCard, FaPalette, FaBell, 
  FaCheck, FaDownload, FaShieldAlt, FaExclamationTriangle
} from "react-icons/fa";

// Import useNavigate from react-router-dom if you're using React Router
import { useNavigate } from "react-router-dom";

const Settings = () => {
  // Add navigate function if using React Router
  const navigate = useNavigate();
  
  // Add a function to handle navigation to Change Password page
  const goToChangePassword = () => {
    navigate("/settings/change-password");
  };

  // Add this function next to the goToChangePassword function
  const goToPricing = () => {
    navigate("/pricing");
  };

  const [profileForm, setProfileForm] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    title: "Product Manager",
    phone: "+1 (555) 123-4567",
    bio: "Product manager with 5+ years of experience in SaaS and fintech industries."
  });

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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
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
          <p className="settings-description">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="settings-tabs">
        <TabsList className="settings-tabs-list">
          <TabsTrigger value="profile" className="settings-tab">
            <FaUser className="tab-icon" />
            <span className="tab-text">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="settings-tab">
            <FaBuilding className="tab-icon" />
            <span className="tab-text">Company</span>
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
          <Card className="profile-card">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="form-grid">
                <div className="form-group">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={profileForm.fullName} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={profileForm.email} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="title">Job Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={profileForm.title} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={profileForm.phone} 
                    onChange={handleProfileChange} 
                  />
                </div>
              </div>
              <div className="form-group bio-container">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio" 
                  name="bio" 
                  value={profileForm.bio} 
                  onChange={handleProfileChange} 
                  rows={4}
                  className="bio-input" 
                />
              </div>
              
              {/* Add Change Password section */}
              <div className="security-section">
                <h3 className="section-title">Account Security</h3>
                <div className="password-link-container">
                  <div className="password-link-info">
                    <h4 className="password-link-title">Password</h4>
                    <p className="password-link-description">
                      Set a unique password to protect your account
                    </p>
                  </div>
                  <Button 
                    variant="link" 
                    className="password-change-link"
                    onClick={goToChangePassword}
                  >
                    Change password
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="form-actions">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card className="password-card">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Update your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="password-form">
              <div className="form-grid">
                <div className="form-group">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="••••••••" />
                </div>
                <div className="spacer"></div>
                <div className="form-group">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
          
          <Card className="danger-card">
            <CardHeader>
              <CardTitle className="danger-title">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="danger-zone">
                <h3 className="danger-zone-title">Delete Account</h3>
                <p className="danger-zone-description">
                  Once you delete your account, there is no going back. This action cannot be undone.
                </p>
                <Button variant="destructive" className="delete-button">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="company" className="settings-tab-content">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="company-form">
              <div className="form-grid">
                <div className="form-group">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="XSCard Inc." />
                </div>
                <div className="form-group">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    options={[
                      { value: "technology", label: "Technology" },
                      { value: "finance", label: "Finance" },
                      { value: "healthcare", label: "Healthcare" },
                      { value: "education", label: "Education" },
                      { value: "retail", label: "Retail" }
                    ]}
                    defaultValue="technology"
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
                      { value: "501+", label: "501+ employees" }
                    ]}
                    defaultValue="50-100"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://xscard.example.com" />
                </div>
              </div>
              <div className="form-group address-container">
                <Label htmlFor="companyAddress">Address</Label>
                <textarea 
                  id="companyAddress" 
                  defaultValue="123 Business Avenue, Suite 200, San Francisco, CA 94107, United States"
                  rows={4}
                  className="address-input" 
                />
              </div>
              
              <div className="branding-section">
                <h3 className="section-title">Company Branding</h3>
                <div className="branding-container">
                  <div className="logo-placeholder">
                    <span>XS</span>
                  </div>
                  <div className="logo-actions">
                    <Button size="sm" variant="outline" className="upload-button">Upload Logo</Button>
                    <p className="logo-hint">Recommended size: 512x512px</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="form-actions">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
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

import React, { useState } from "react";
import { FaChevronLeft, FaUpload, FaEye, FaMobile, FaSave } from "react-icons/fa";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Textarea } from "../UI/textarea";
import { Card, CardContent } from "../UI/card";
import { useNavigate } from "react-router-dom";
import { HexColorPicker } from "react-colorful";
import "../../styles/CreateCard.css";

const CreateCard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    jobTitle: "",
    department: "",
    email: "",
    phone: "",
    company: "XSCard Inc.",
    website: "https://xscard.com",
    bio: "",
    template: "modern",
    color: "#4338ca"
  });
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState('full');
  
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };
  
  const departments = [
    { label: "Select department", value: "" },
    { label: "Marketing", value: "marketing" },
    { label: "Sales", value: "sales" },
    { label: "Engineering", value: "engineering" },
    { label: "Product", value: "product" },
    { label: "Operations", value: "operations" },
    { label: "Customer Support", value: "customer-support" }
  ];
  
  const templates = [
    { label: "Modern", value: "modern" },
    { label: "Classic", value: "classic" },
    { label: "Minimal", value: "minimal" },
    { label: "Bold", value: "bold" },
    { label: "Elegant", value: "elegant" }
  ];
  
  return (
    <div className="create-card-container">
      <div className="header">
        <button 
          className="back-button"
          onClick={() => navigate('/dashboard/business-cards')}
        >
          <FaChevronLeft />
        </button>
        <div>
          <h1 className="title">Create New Business Card</h1>
          <p className="subtitle">Design a digital business card for your team member</p>
        </div>
      </div>
      
      <div className="content">
        <div className="form-section">
          <Card>
            <CardContent>
              <h2 className="section-title">Personal Information</h2>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="label">Full Name</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="form-field">
                  <label className="label">Job Title</label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    placeholder="Marketing Director"
                  />
                </div>
                
                <div className="form-field">
                  <label className="label">Department</label>
                  <div className="select-container">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleSelectChange}
                      className="select-input"
                    >
                      {departments.map((dept, index) => (
                        <option key={index} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-field">
                  <label className="label">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john.doe@xscard.com"
                    type="email"
                  />
                </div>
                
                <div className="form-field">
                  <label className="label">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                  />
                </div>
                
                <div className="form-field">
                  <label className="label">Website</label>
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://xscard.com"
                    type="url"
                  />
                </div>
              </div>
              
              <div className="form-field full-width">
                <label className="label">Bio / About</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Enter a brief professional bio or description"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-design-card">
            <CardContent>
              <h2 className="section-title">Card Design</h2>
              
              <div className="design-grid">
                <div className="form-field">
                  <label className="label">Template Style</label>
                  <div className="select-container">
                    <select
                      name="template"
                      value={formData.template}
                      onChange={handleSelectChange}
                      className="select-input"
                    >
                      {templates.map((template, index) => (
                        <option key={index} value={template.value}>{template.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-field">
                  <label className="label">Primary Color</label>
                  <div className="color-picker-container">
                    <div 
                      className="color-preview"
                      style={{ backgroundColor: formData.color }}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                    ></div>
                    <Input
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      placeholder="#4338ca"
                      className="color-input"
                    />
                  </div>
                  
                  {showColorPicker && (
                    <div className="color-picker-modal">
                      <HexColorPicker 
                        color={formData.color} 
                        onChange={handleColorChange} 
                        className="color-picker"
                      />
                      <Button 
                        onClick={() => setShowColorPicker(false)}
                        className="close-color-picker-button"
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="photo-upload-section">
                <label className="label">Profile Photo</label>
                <div className="upload-container">
                  <div className="upload-content">
                    <div className="upload-icon-container">
                      <FaUpload className="upload-icon" />
                    </div>
                    <h3 className="upload-title">Upload Photo</h3>
                    <p className="upload-description">
                      Drag and drop or click to upload (JPG, PNG, max 5MB)
                    </p>
                    <Button variant="outline" className="browse-button">
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="preview-section">
          <Card>
            <CardContent className="preview-card-content">
              <h2 className="preview-title">Card Preview</h2>
              
              <div className="card-preview">
                <div 
                  className="card-preview-header"
                  style={{ backgroundColor: formData.color }}
                >
                  <div className="card-preview-header-content">
                    <p className="card-preview-name">
                      {formData.fullName || "Your Name"}
                    </p>
                    <p className="card-preview-job-title">
                      {formData.jobTitle || "Job Title"}
                    </p>
                    <p className="card-preview-department">
                      {formData.department 
                        ? formData.department.charAt(0).toUpperCase() + formData.department.slice(1) 
                        : "Department"}
                    </p>
                  </div>
                </div>
                
                <div className="card-preview-body">
                  <div className="card-preview-field">
                    <p className="card-preview-field-label">Email</p>
                    <p className="card-preview-field-value">
                      {formData.email || "email@xscard.com"}
                    </p>
                  </div>
                  
                  <div className="card-preview-field">
                    <p className="card-preview-field-label">Phone</p>
                    <p className="card-preview-field-value">
                      {formData.phone || "+1 (555) 123-4567"}
                    </p>
                  </div>
                  
                  <div className="card-preview-field">
                    <p className="card-preview-field-label">Company</p>
                    <p className="card-preview-field-value">{formData.company}</p>
                  </div>
                  
                  <div className="qr-code-container">
                    <div className="qr-code-placeholder"></div>
                  </div>
                </div>
              </div>
              
              <div className="preview-actions">
                <Button 
                  variant="outline" 
                  size="sm"
                  leftIcon={<FaEye />}
                  onClick={() => setPreviewMode('full')}
                  className={previewMode === 'full' ? 'active-preview-button' : ''}
                >
                  Full Preview
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  leftIcon={<FaMobile />}
                  onClick={() => setPreviewMode('mobile')}
                  className={previewMode === 'mobile' ? 'active-preview-button' : ''}
                >
                  Mobile View
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="action-buttons">
            <Button 
              variant="outline" 
              className="cancel-button"
              onClick={() => navigate('/dashboard/business-cards')}
            >
              Cancel
            </Button>
            <Button 
              className="save-button"
              leftIcon={<FaSave />}
            >
              Save Card
            </Button>
          </div>
          
          <p className="save-note">
            Once saved, this card can be shared via email, QR code, or direct link
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateCard;

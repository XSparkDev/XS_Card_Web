import { useState } from "react";
import { FaSearch, FaFilter, FaDownload, FaPlus, FaQrcode, FaShare, FaEdit } from "react-icons/fa";
import { Button } from "../UI/button";
import { Card } from "../UI/card";
import { Input } from "../UI/input";
import "../../styles/BusinessCards.css";

// Mock data
const mockCards = [
  {
    id: "1",
    name: "John Smith",
    title: "Chief Executive Officer",
    department: "Executive",
    email: "john.smith@company.com",
    phone: "+27 123 456 789",
    scans: 324,
    createdAt: "2023-05-12",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    title: "Sales Director",
    department: "Sales",
    email: "sarah.johnson@company.com",
    phone: "+27 234 567 890",
    scans: 245,
    createdAt: "2023-06-18",
  },
  {
    id: "3",
    name: "Robert Chen",
    title: "Marketing Lead",
    department: "Marketing",
    email: "robert.chen@company.com",
    phone: "+27 345 678 901",
    scans: 193,
    createdAt: "2023-07-29",
  },
  {
    id: "4",
    name: "Leila Ndong",
    title: "Business Development Manager",
    department: "Business Development",
    email: "leila.ndong@company.com",
    phone: "+27 456 789 012",
    scans: 156,
    createdAt: "2023-08-14",
  },
  {
    id: "5",
    name: "Michael Patel",
    title: "Account Manager",
    department: "Sales",
    email: "michael.patel@company.com",
    phone: "+27 567 890 123",
    scans: 124,
    createdAt: "2023-09-02",
  },
];

// Add this function to determine card colors based on department
const getCardColor = (department: string): string => {
  const colors: Record<string, string> = {
    'Executive': '#4361ee',
    'Marketing': '#3a86ff',
    'Sales': '#38b000',
    'Engineering': '#9d4edd',
    'Finance': '#ff5400',
    'HR': '#ff006e',
    'Product': '#8338ec',
    'Customer Support': '#fb8500'
  };
  
  return colors[department] || '#4361ee'; // Default to blue if department not found
};

const BusinessCardItem = ({ card }: { card: typeof mockCards[0] }) => {
  return (
    <div key={card.id} className="business-card">
      <div className="business-card-content">
        <div className="business-card-left" style={{ backgroundColor: getCardColor(card.department) }}>
          <h3 className="business-card-name">{card.name}</h3>
          <p className="business-card-title">{card.title}</p>
        </div>
        
        <div className="business-card-right">
          <p className="business-card-department">Department: {card.department}</p>
          <p className="business-card-email">{card.email}</p>
          <p className="business-card-phone">{card.phone}</p>
          
          <div className="business-card-footer">
            <span className="business-card-scans">{card.scans || 0} scans</span>
            <div className="business-card-actions">
              <button className="action-button" title="QR Code">
                <i className="fas fa-qrcode"></i>
              </button>
              <button className="action-button" title="Share">
                <i className="fas fa-share-alt"></i>
              </button>
              <button className="action-button" title="Edit">
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessCards = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredCards = mockCards.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="business-cards-container">
      <div className="cards-header">
        <div>
          <h1 className="cards-title">Business Cards</h1>
          <p className="cards-subtitle">Manage all your company's digital business cards</p>
        </div>
        <div className="header-buttons">
          <Button 
            variant="outline" 
            leftIcon={<FaDownload />}
            onClick={() => console.log('Export')}
          >
            Export
          </Button>
          <Button 
            leftIcon={<FaPlus />}
            onClick={() => console.log('Create Card')}
          >
            Create Card
          </Button>
        </div>
      </div>
      
      <div className="search-container">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <Input
            placeholder="Search cards..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          leftIcon={<FaFilter />}
          className="filter-button"
          onClick={() => console.log('Filter')}
        >
          Filter
        </Button>
      </div>
      
      <div className="tabs-container">
        <div className="tabs-list">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active-tab-button' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Cards
          </button>
          <button 
            className={`tab-button ${activeTab === 'recent' ? 'active-tab-button' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent
          </button>
          <button 
            className={`tab-button ${activeTab === 'departments' ? 'active-tab-button' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            By Department
          </button>
        </div>
        
        {activeTab === 'all' && (
          <div className="cards-grid">
            {filteredCards.map(card => (
              <BusinessCardItem key={card.id} card={card} />
            ))}
          </div>
        )}
        
        {activeTab === 'recent' && (
          <div className="cards-grid">
            {filteredCards
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map(card => (
                <BusinessCardItem key={card.id} card={card} />
              ))
            }
          </div>
        )}
        
        {activeTab === 'departments' && (
          <div className="departments-container">
            {['Executive', 'Sales', 'Marketing', 'Business Development'].map((dept) => (
              <div key={dept} className="department-section">
                <h2 className="department-title">{dept}</h2>
                <div className="cards-grid">
                  {filteredCards
                    .filter(card => card.department === dept)
                    .map(card => (
                      <BusinessCardItem key={card.id} card={card} />
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCards;

import React, { useState } from "react";
import { FaSearch, FaFilter, FaDownload, FaPlus, FaQrcode, FaShare, FaEdit } from "react-icons/fa";
import { Button } from "../UI/button";
import { Card, CardContent } from "../UI/card";
import { Input } from "../UI/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import "../../styles/BusinessCards.css";
import "../../styles/Dashboard.css";

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
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Cards</h1>
          <p className="page-description">Manage and customize your digital business cards</p>
        </div>
        <div className="page-actions">
          <Button>
            <FaPlus className="mr-2" size={14} />
            Create Card
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="business-cards-tabs">
        <TabsList className="business-cards-tabs-list">
          <TabsTrigger value="all">All Cards</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
        </TabsList>
        
        <div className="search-filter-container">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search cards..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="filter-button">
            <FaFilter className="mr-2" size={12} />
            Filter
          </Button>
        </div>
        
        <TabsContent value="all" className="mt-4">
          <div className="cards-grid">
            {mockCards.map(card => (
              <BusinessCardItem key={card.id} card={card} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="cards-grid">
            {mockCards
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map(card => (
                <BusinessCardItem key={card.id} card={card} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="department">
          <div className="cards-grid">
            {mockCards.filter(card => card.department === "Sales")
              .map(card => (
                <BusinessCardItem key={card.id} card={card} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessCards;

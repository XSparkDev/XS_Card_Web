import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaDownload, FaPlus, FaQrcode, FaShare, FaEdit } from "react-icons/fa";
import { Button } from "../UI/button";
import { Card, CardContent } from "../UI/card";
import { Input } from "../UI/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import "../../styles/BusinessCards.css";
import "../../styles/Dashboard.css";

// Interface for the card data
interface CardData {
  id?: string;
  fullName: string;
  occupation: string;
  department: string;
  email: string;
  number: string;
  numberOfScan: number;
  createdAt?: string;
}

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

const BusinessCardItem = ({ card }: { card: CardData }) => {
  return (
    <div key={card.id} className="business-card">
      <div className="business-card-content">
        <div className="business-card-left" style={{ backgroundColor: getCardColor(card.department) }}>
          <h3 className="business-card-name">{card.fullName}</h3>
          <p className="business-card-title">{card.occupation}</p>
        </div>
        
        <div className="business-card-right">
          <p className="business-card-department">Department: {card.department}</p>
          <p className="business-card-email">{card.email}</p>
          <p className="business-card-phone">{card.number}</p>
          
          <div className="business-card-footer">
            <span className="business-card-scans">{card.numberOfScan || 0} scans</span>
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
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://3bcc5669-46d9-485e-9c2a-6813b9b74336.mock.pstmn.io/cards");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data: CardData[] = await response.json();
        
        // Add IDs and createdAt if they don't exist
        const processedData = data.map((card, index) => ({
          ...card,
          id: card.id || `${index + 1}`,
          createdAt: card.createdAt || new Date().toISOString().split('T')[0]
        }));
        
        setCards(processedData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch business cards. Please try again later.");
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, []);
  
  // Filter cards based on search term
  const filteredCards = cards.filter(card => 
    card.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Cards</h1>
          <p className="page-description">Manage and customize your digital business cards</p>
        </div>
        <div className="page-actions">
          
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
        
        {loading ? (
          <div className="loading-state">Loading business cards...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            <TabsContent value="all" className="mt-4">
              <div className="cards-grid">
                {filteredCards.map(card => (
                  <BusinessCardItem key={card.id} card={card} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="cards-grid">
                {filteredCards
                  .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
                  .slice(0, 3)
                  .map(card => (
                    <BusinessCardItem key={card.id} card={card} />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="department">
              <div className="cards-grid">
                {filteredCards
                  .filter(card => card.department === "Sales")
                  .map(card => (
                    <BusinessCardItem key={card.id} card={card} />
                  ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default BusinessCards;

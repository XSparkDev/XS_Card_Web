import { useState, useEffect } from "react";
import { FaSearch, FaQrcode, FaShare, FaEdit } from "react-icons/fa";
import { Button } from "../UI/button";
import "../../styles/BusinessCards.css";
import "../../styles/Dashboard.css";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, buildUrl, FIREBASE_TOKEN } from "../../utils/api";
import { useUserContext } from "../../hooks/useUserContext";

// Update the CardData interface to include only the fields we need
interface CardData {
  id?: string;
  name: string;
  surname: string;
  occupation: string;
  email: string;
  phone: string;
  colorScheme: string;
  numberOfScan?: number;
  departmentName?: string;
  employeeTitle?: string;
  // Image fields that already exist in the backend
  profileImage?: string | null;
  companyLogo?: string | null;
  // Additional fields that might exist
  cardImage?: string | null;
}

// Add this function to determine card colors based on department
const getCardColor = (colorScheme: string): string => {
  return colorScheme || '#4361ee'; // Default to blue if colorScheme not found
};

// Function to fetch cards based on user type
const fetchCardsByUserType = async (isEnterprise: boolean, enterpriseId?: string, userId?: string): Promise<CardData[]> => {
  if (isEnterprise) {
    // Enterprise user - fetch enterprise cards
    const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CARDS, enterpriseId);
    const headers = getEnterpriseHeaders();
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Enterprise cards fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return processCardsData(responseData);
  } else {
    // Individual user - fetch user's own cards
    const url = buildUrl(`${ENDPOINTS.GET_CARD}/${userId}`);
    
    // TODO: When login page is implemented, get token from localStorage
    // For now, use the hardcoded Firebase token from api.ts
    const token = FIREBASE_TOKEN;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('Fetching individual cards with URL:', url); // Debug log
    console.log('Using headers for cards:', headers); // Debug log
    
    const response = await fetch(url, { headers });
    
    console.log('Cards API response status:', response.status); // Debug log
    
    if (!response.ok) {
      throw new Error(`Individual cards fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return processCardsData(responseData);
  }
};

// Helper function to process cards data consistently
const processCardsData = (responseData: any): CardData[] => {
  let cardsData: CardData[] = [];
  
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
  
  // Add IDs if they don't exist and normalize data
  return cardsData.map((card, index) => ({
    ...card,
    id: card.id || `${index + 1}`,
    numberOfScan: card.numberOfScan || 0,
    departmentName: card.departmentName || 'N/A',
    employeeTitle: card.employeeTitle || card.occupation || 'N/A'
  }));
};

const BusinessCardItem = ({ card }: { card: CardData }) => {
  return (
    <div key={card.id} className="business-card">
      <div className="business-card-content">
        <div className="business-card-left" style={{ backgroundColor: getCardColor(card.colorScheme) }}>
          <div className="xscard-logo">
            <span>XS</span>
          </div>
        </div>
        
        <div className="business-card-right">
          <div className="business-card-info">
            <h3 className="business-card-name">{card.name} {card.surname}</h3>
            <p className="business-card-title">{card.occupation || card.employeeTitle || 'N/A'}</p>
            {card.departmentName && card.departmentName !== 'N/A' && (
              <p className="business-card-department">{card.departmentName}</p>
            )}
          </div>
          
          <div className="business-card-contact-info">
            <p className="business-card-email">{card.email}</p>
            <p className="business-card-phone">{card.phone}</p>
          </div>
          
          <div className="business-card-footer">
            <span className="business-card-scans">{card.numberOfScan || 0} scans</span>
            <div className="business-card-actions">
              <button className="action-button" title="QR Code">
                <FaQrcode />
              </button>
              <button className="action-button" title="Share">
                <FaShare />
              </button>
              <button className="action-button" title="Edit">
                <FaEdit />
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
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the custom hook for user context
  const userContext = useUserContext();
  
  useEffect(() => {
    const fetchCards = async () => {
      // Wait for user context to be determined
      if (userContext.isLoading) {
        return;
      }
      
      try {
        setLoading(true);
        
        console.log('User context detected:', userContext);
        
        // Fetch cards based on user type
        const cardsData = await fetchCardsByUserType(userContext.isEnterprise, userContext.enterpriseId, userContext.userId);
        
        setCards(cardsData);
        // Auto-select first card if none selected
        if (cardsData.length > 0 && !selectedCard) {
          setSelectedCard(cardsData[0]);
        }
        setError(null);
        
        console.log('Processed cards data:', cardsData);
      } catch (err) {
        setError("Failed to fetch business cards. Please try again later.");
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, [userContext.isLoading, userContext.isEnterprise, userContext.enterpriseId, userContext.userId]);
  
  // Filter cards based on search term
  const filteredCards = cards.filter(card => 
    `${card.name} ${card.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Show loading state while user context is being determined
  if (userContext.isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">Determining user type...</div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Cards</h1>
          <p className="page-description">
            {userContext.isEnterprise 
              ? "Manage and customize your enterprise digital business cards" 
              : "Manage and customize your digital business cards"
            }
          </p>
          <div className="user-type-indicator">
            <span className={`badge ${userContext.isEnterprise ? 'enterprise' : 'individual'}`}>
              {userContext.isEnterprise ? 'Enterprise' : 'Individual'} User
            </span>
            {userContext.error && (
              <span className="badge error" style={{ marginLeft: '0.5rem', backgroundColor: '#dc2626' }}>
                {userContext.error}
              </span>
            )}
          </div>
        </div>
        <div className="page-actions">
          <Button>
            <FaQrcode className="mr-2" />
            Create Card
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">Loading business cards...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="cards-layout">
          {/* Card List Sidebar */}
          <div className="cards-sidebar">
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
            
            <div className="cards-list">
              {filteredCards.length > 0 ? (
                filteredCards.map(card => (
                  <div 
                    key={card.id} 
                    className={`card-list-item ${selectedCard?.id === card.id ? 'active' : ''}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="card-list-avatar" style={{ backgroundColor: getCardColor(card.colorScheme) }}>
                      <span>{card.name[0]}{card.surname[0]}</span>
                    </div>
                    <div className="card-list-info">
                      <h4>{card.name} {card.surname}</h4>
                      <p>{card.occupation || card.employeeTitle}</p>
                      <span>{card.numberOfScan || 0} scans</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cards-list">
                  <p>No cards found</p>
                  {searchTerm && <p>Try adjusting your search</p>}
                </div>
              )}
            </div>
          </div>
          
          {/* Selected Card Display */}
          <div className="card-display">
            {selectedCard ? (
              <div className="selected-card-container">
                <BusinessCardItem card={selectedCard} />
                <div className="card-actions-panel">
                  <Button>
                    <FaQrcode className="mr-2" />
                    Generate QR Code
                  </Button>
                  <Button variant="outline">
                    <FaShare className="mr-2" />
                    Share Card
                  </Button>
                  <Button variant="outline">
                    <FaEdit className="mr-2" />
                    Edit Card
                  </Button>
                </div>
              </div>
            ) : (
              <div className="no-card-selected">
                <p>Select a card from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCards;

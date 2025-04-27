import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaQrcode, FaShare, FaEdit } from "react-icons/fa";
import { Button } from "../UI/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import "../../styles/BusinessCards.css";
import "../../styles/Dashboard.css";
import { API_BASE_URL } from "../../utils/api";

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
}

// Add this function to determine card colors based on department
const getCardColor = (colorScheme: string): string => {
  return colorScheme || '#4361ee'; // Default to blue if colorScheme not found
};

const BusinessCardItem = ({ card }: { card: CardData }) => {
  return (
    <div key={card.id} className="business-card">
      <div className="business-card-content">
        <div className="business-card-left" style={{ backgroundColor: getCardColor(card.colorScheme) }}>
          <h3 className="business-card-name">{card.name} {card.surname}</h3>
        </div>
        
        <div className="business-card-right">
          <p className="business-card-department">Department: {card.departmentName || 'N/A'}</p>
          <p className="business-card-occupation" style={{ marginTop: '4px' }}>Position: {card.occupation || card.employeeTitle || 'N/A'}</p>
          <p className="business-card-email" style={{ marginTop: '4px' }}>{card.email}</p>
          <p className="business-card-phone">{card.phone}</p>
          
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        
        // Use the real API endpoint instead of the Postman mock server
        const enterpriseId = "PegXyjZYojbLudlmOmDf";
        const endpoint = `enterprise/${enterpriseId}/cards`;
        const url = `${API_BASE_URL}/${endpoint}`;
        
        // Firebase JWT token
        const firebaseToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjkwOTg1NzhjNDg4MWRjMDVlYmYxOWExNWJhMjJkOGZkMWFiMzRjOGEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20veHNjYXJkLWFkZGQ0IiwiYXVkIjoieHNjYXJkLWFkZGQ0IiwiYXV0aF90aW1lIjoxNzQ1NzU1NTUyLCJ1c2VyX2lkIjoiRWNjeU1Ddjd1aVMxZVlIQjNaTXU2elJSMURHMiIsInN1YiI6IkVjY3lNQ3Y3dWlTMWVZSEIzWk11NnpSUjFERzIiLCJpYXQiOjE3NDU3NTU1NTIsImV4cCI6MTc0NTc1OTE1MiwiZW1haWwiOiJ0ZXN0ZWhha2tlQGd1ZnVtLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RlaGFra2VAZ3VmdW0uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.Rk40t9NJT5KEIUztmCo3nrvWSskGIDqEaffiaO7uzufgs-cQW_GxYMdM5DgGC5YKvSvtmgqmTjhwcYcf2AqgqglVWr1x4pVMnlQOjQjC0kP0nLi_3WybnuTNId7BcXEWEUizoc6_dJmmJqZcwd4ygejnPiX39T5KMdWlK8QDOLeOHatMBwWr9fWNdekbx6FeDKSi8OrPYvnnzxd633803QiPTrj2Pu80Fc-g8BB_3rfol_UGF3OBjZ3L1t8UG9nFT-VbWVMiX8SpDKlIPbZZsNekUVqlqN4G-zZDWSSM66JeJbur3zwSHt_ubmYZ1UsDMkXKgJJ-mh-K26_yFwNFVg";
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${firebaseToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the response
        const responseData = await response.json();
        
        // Check if the data is in an array format, if not, extract it from the response structure
        let cardsData: CardData[] = [];
        
        if (Array.isArray(responseData)) {
          // If the response is already an array of cards
          cardsData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // If the response is an object that might contain a data/cards property
          if (Array.isArray(responseData.data)) {
            cardsData = responseData.data;
          } else if (Array.isArray(responseData.cards)) {
            cardsData = responseData.cards;
          } else {
            // If the object itself contains the card data (single card)
            cardsData = [responseData];
          }
        }
        
        // Add IDs if they don't exist
        const processedData = cardsData.map((card, index) => ({
          ...card,
          id: card.id || `${index + 1}`,
          numberOfScan: card.numberOfScan || 0
        }));
        
        setCards(processedData);
        setError(null);
        
        // Log the processed data for debugging
        console.log('Processed cards data:', processedData);
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
    `${card.name} ${card.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                  .slice(0, 3)
                  .map(card => (
                    <BusinessCardItem key={card.id} card={card} />
                  ))}
              </div>
            </TabsContent>
            
            {/* <TabsContent value="department">
              <div className="cards-grid">
                {filteredCards
                  .filter(card => card.company === "Nexus") // Example company filter
                  .map(card => (
                    <BusinessCardItem key={card.id} card={card} />
                  ))}
              </div>
            </TabsContent> */}
          </>
        )}
      </Tabs>
    </div>
  );
};

export default BusinessCards;

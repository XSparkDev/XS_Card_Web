import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaSearch, FaFilter, FaDownload, FaUserPlus, FaEnvelope, FaPhone, FaEllipsisH, FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../UI/card";
import { Badge } from "../UI/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import "../../styles/Contacts.css";
import "../../styles/Dashboard.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../UI/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../UI/dialog";

// Define contact interface
interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  addedOn: string;
  lastContact: string;
  favorite: boolean;
  avatar: string;
}

const ContactItem = ({ contact }: { contact: Contact }) => {
  const [favorite, setFavorite] = useState(contact.favorite);
  const initials = contact.name.split(' ').map(n => n[0]).join('');
  
  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleDeleteContact = (id: string) => {
    // Implement the delete logic
    console.log(`Delete contact with id: ${id}`);
  };

  const handleUpdateContact = (id: string) => {
    // Implement the update logic
    console.log(`Update contact with id: ${id}`);
  };

  return (
    <Card className="contact-card">
      <CardContent>
        <div className="contact-header">
          <div className="contact-info">
            <div className="avatar">
              <span className="avatar-text">{initials}</span>
            </div>
            <div>
              <p className="contact-name">{contact.name}</p>
              <p className="contact-title">{contact.title} at {contact.company}</p>
            </div>
          </div>
          <div className="contact-actions">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="action-button">
                  <FaEllipsisV />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dropdown-content">
                
                <DropdownMenuItem onClick={() => handleDeleteContact(contact.id)}>
                  <FaTrash className="action-icon" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="contact-details">
          <div className="contact-detail">
            <FaEnvelope className="contact-icon" />
            <p className="contact-text">{contact.email}</p>
          </div>
          <div className="contact-detail">
            <FaPhone className="contact-icon" />
            <p className="contact-text">{contact.phone}</p>
          </div>
        </div>
        
        <div className="contact-footer">
          <div className="contact-dates">
            <p className="date-text">Added: {new Date(contact.addedOn).toLocaleDateString()}</p>
            <p className="date-text separator">•</p>
            <p className="date-text">Last contact: {new Date(contact.lastContact).toLocaleDateString()}</p>
          </div>
          <div className="contact-actions">
            <Button 
              variant="outline" 
              className="email-button"
              leftIcon={<FaEnvelope />}
              onClick={() => handleEmailClick(contact.email)}
            >
              Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Contacts = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch contacts from the API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // Using the Postman mock server URL from help.md
        const userId = "current"; // This can be dynamic if needed
        const response = await fetch(`https://96b20ff1-0262-4b5c-9df9-ce99f48cfc94.mock.pstmn.io/Contacts/${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setContacts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching contacts:", err);
        setError("Failed to load contacts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, []);
  
  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get recent contacts - sort by last contact date
  const recentContacts = [...filteredContacts]
    .sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime())
    .slice(0, 3);
  
  // Get favorite contacts
  const favoriteContacts = filteredContacts.filter(contact => contact.favorite);
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-description">Manage your network and connections</p>
        </div>
        <div className="page-actions">
          <Button>
            <FaUserPlus className="mr-2" size={14} />
            Add Contact
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="contacts-tabs">
        <TabsList className="contacts-tabs-list">
          <TabsTrigger value="all">All Contacts</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        
        <div className="contacts-search-actions">
          <div className="contacts-search">
            <FaSearch className="search-icon" />
            <Input 
              type="text" 
              placeholder="Search contacts..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="filter-button">
            Filter
          </Button>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading contacts...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>
            <TabsContent value="all" className="mt-4">
              <div className="contacts-list">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <ContactItem key={contact.id} contact={contact} />
                  ))
                ) : (
                  <div className="no-results">No contacts found. Try adjusting your search.</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="contacts-list">
                {recentContacts.length > 0 ? (
                  recentContacts.map(contact => (
                    <ContactItem key={contact.id} contact={contact} />
                  ))
                ) : (
                  <div className="no-results">No recent contacts found.</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="favorites">
              <div className="contacts-list">
                {favoriteContacts.length > 0 ? (
                  favoriteContacts.map(contact => (
                    <ContactItem key={contact.id} contact={contact} />
                  ))
                ) : (
                  <div className="no-results">No favorite contacts found.</div>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Contacts;

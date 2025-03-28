import { useState } from "react";
import { FaStar, FaRegStar, FaSearch, FaFilter, FaDownload, FaUserPlus, FaEnvelope, FaPhone, FaEllipsisH } from "react-icons/fa";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Card, CardContent } from "../UI/card";
import "../../styles/Contacts.css";

const mockContacts = [
  {
    id: "1",
    name: "Jason Reynolds",
    title: "Marketing Director",
    company: "TechGlobe Inc.",
    email: "jason.reynolds@techglobe.com",
    phone: "+1 (415) 555-1234",
    addedOn: "2023-06-15",
    lastContact: "2023-09-02",
    favorite: true,
    avatar: "",
  },
  {
    id: "2",
    name: "Sarah Chen",
    title: "CTO",
    company: "FutureSys Co.",
    email: "sarah.chen@futuresys.com",
    phone: "+1 (212) 555-6789",
    addedOn: "2023-05-28",
    lastContact: "2023-08-15",
    favorite: false,
    avatar: "",
  },
  {
    id: "3",
    name: "Michael Okonkwo",
    title: "Sales Manager",
    company: "GlobalVision Group",
    email: "michael.o@globalvision.com",
    phone: "+1 (312) 555-4321",
    addedOn: "2023-07-10",
    lastContact: "2023-09-10",
    favorite: true,
    avatar: "",
  },
  {
    id: "4",
    name: "Amelia Garcia",
    title: "Product Lead",
    company: "InnovateTech",
    email: "amelia.garcia@innovatetech.com",
    phone: "+1 (650) 555-8765",
    addedOn: "2023-08-05",
    lastContact: "2023-09-01",
    favorite: false,
    avatar: "",
  },
  {
    id: "5",
    name: "Robert Kim",
    title: "Operations Director",
    company: "StrategicOps LLC",
    email: "robert.kim@strategicops.com",
    phone: "+1 (206) 555-3456",
    addedOn: "2023-06-20",
    lastContact: "2023-08-25",
    favorite: false,
    avatar: "",
  },
];

const ContactItem = ({ contact }: { contact: typeof mockContacts[0] }) => {
  const [favorite, setFavorite] = useState(contact.favorite);
  const initials = contact.name.split(' ').map(n => n[0]).join('');
  
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
          <button 
            className="favorite-button"
            onClick={() => setFavorite(!favorite)}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? <FaStar className="star-icon-filled" /> : <FaRegStar className="star-icon" />}
          </button>
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
            >
              Email
            </Button>
            <Button 
              variant="ghost" 
              className="more-button"
              leftIcon={<FaEllipsisH />}
              aria-label="More options"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getTabContacts = () => {
    switch (activeTab) {
      case "recent":
        return [...filteredContacts]
          .sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime())
          .slice(0, 3);
      case "favorites":
        return filteredContacts.filter(contact => contact.favorite);
      default:
        return filteredContacts;
    }
  };
  
  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <div>
          <h1 className="contacts-title">Contacts</h1>
          <p className="contacts-subtitle">Manage and organize your business network</p>
        </div>
        <div className="header-buttons">
          <Button 
            variant="outline" 
            className="export-button"
            leftIcon={<FaDownload />}
            onClick={() => console.log('Export')}
          >
            Export
          </Button>
          <Button 
            className="add-button"
            leftIcon={<FaUserPlus />}
            onClick={() => console.log('Add Contact')}
          >
            Add Contact
          </Button>
        </div>
      </div>
      
      <div className="search-container">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <Input
            placeholder="Search contacts..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="filter-button"
          leftIcon={<FaFilter />}
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
            All Contacts
          </button>
          <button 
            className={`tab-button ${activeTab === 'recent' ? 'active-tab-button' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorites' ? 'active-tab-button' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
        </div>
        
        <div className="contacts-list">
          {getTabContacts().map(contact => (
            <ContactItem key={contact.id} contact={contact} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contacts;

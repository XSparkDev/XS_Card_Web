import React, { useState } from "react";
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
            />
          </div>
          <Button variant="outline" className="filter-button">
            Filter
          </Button>
        </div>
        
        <TabsContent value="all" className="mt-4">
          <div className="contacts-list">
            {mockContacts.map(contact => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="contacts-list">
            {mockContacts.sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()).slice(0, 3).map(contact => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites">
          <div className="contacts-list">
            {mockContacts.filter(contact => contact.favorite).map(contact => (
              <ContactItem key={contact.id} contact={contact} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contacts;

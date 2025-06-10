import { useState, useEffect } from "react";
import { FaSearch, FaEnvelope, FaPhone, FaEllipsisV, FaTrash, FaBuilding } from "react-icons/fa";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Card, CardContent } from "../UI/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/selectRadix";
import "../../styles/Contacts.css";
import "../../styles/Dashboard.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../UI/dropdown-menu";
import { buildEnterpriseUrl, getEnterpriseHeaders, ENDPOINTS } from "../../utils/api";

// Define contact interface based on API response
interface Contact {
  name: string;
  surname: string;
  phone: string;
  howWeMet: string;
  email: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  ownerInfo: {
    userId: string;
    email: string;
    department: string;
    departmentName?: string;
  };
  enterpriseId: string;
  enterpriseName?: string;
}

// Define department interface based on API response
interface Department {
  id: string;
  name: string;
  contactCount: number;
}

// Define API response interfaces
interface EnterpriseContactsResponse {
  success: boolean;
  cached: boolean;
  data: {
    enterpriseId: string;
    enterpriseName: string;
    totalContacts: number;
    totalDepartments: number;
    departmentStats: Record<string, {
      name: string;
      contactCount: number;
      employeeCount: number;
    }>;
    contactsByDepartment: Record<string, {
      departmentName: string;
      departmentId: string;
      contacts: Contact[];
      contactCount: number;
    }>;
  };
}

interface DepartmentContactsResponse {
  success: boolean;
  cached: boolean;
  data: {
    enterpriseId: string;
    enterpriseName: string;
    departmentId: string;
    departmentName: string;
    totalContacts: number;
    contacts: Contact[];
  };
}

const ContactItem = ({ contact }: { contact: Contact }) => {
  const fullName = `${contact.name} ${contact.surname}`;
  const initials = `${contact.name[0]}${contact.surname[0]}`;
  
  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleDeleteContact = (email: string) => {
    // Implement the delete logic
    console.log(`Delete contact with email: ${email}`);
  };

  // Convert Firebase timestamp to date
  const createdDate = new Date(contact.createdAt._seconds * 1000);

  return (
    <Card className="contact-card">
      <CardContent>
        <div className="contact-header">
          <div className="contact-info">
            <div className="avatar">
              <span className="avatar-text">{initials}</span>
            </div>
            <div>
              <p className="contact-name">{fullName}</p>
              <p className="contact-title">Met: {contact.howWeMet}</p>
              {contact.ownerInfo.departmentName && (
                <p className="contact-department">
                  <FaBuilding className="department-icon" />
                  {contact.ownerInfo.departmentName}
                </p>
              )}
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
                <DropdownMenuItem onClick={() => handleDeleteContact(contact.email)}>
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
            <p className="date-text">Added: {createdDate.toLocaleDateString()}</p>
            <p className="date-text separator">•</p>
            <p className="date-text">Owner: {contact.ownerInfo.email}</p>
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
    // Fetch departments from the API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CONTACTS);
        const response = await fetch(url, {
          headers: getEnterpriseHeaders(),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const apiResponse: EnterpriseContactsResponse = await response.json();
        
        // Extract departments from departmentStats
        const departmentList: Department[] = Object.entries(apiResponse.data.departmentStats).map(([id, stats]) => ({
          id,
          name: stats.name,
          contactCount: stats.contactCount
        }));
        
        setDepartments(departmentList);
      } catch (err) {
        console.error("Error fetching departments:", err);
        // Don't set error here as departments are optional
      }
    };
    
    fetchDepartments();
  }, []);
    // Fetch contacts from the API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        
        if (selectedDepartment === "all") {
          // Get all enterprise contacts
          const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CONTACTS);
          const response = await fetch(url, {
            headers: getEnterpriseHeaders(),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const apiResponse: EnterpriseContactsResponse = await response.json();
          
          // Flatten all contacts from all departments
          const allContacts: Contact[] = [];
          Object.values(apiResponse.data.contactsByDepartment).forEach(dept => {
            // Add department name to each contact
            const contactsWithDept = dept.contacts.map(contact => ({
              ...contact,
              ownerInfo: {
                ...contact.ownerInfo,
                departmentName: dept.departmentName
              }
            }));
            allContacts.push(...contactsWithDept);
          });
          
          setContacts(allContacts);
        } else {
          // Get contacts for specific department
          const url = buildEnterpriseUrl(
            ENDPOINTS.ENTERPRISE_DEPARTMENT_CONTACTS.replace(':departmentId', selectedDepartment)
          );
          
          const response = await fetch(url, {
            headers: getEnterpriseHeaders(),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const apiResponse: DepartmentContactsResponse = await response.json();
          
          // Add department name to each contact
          const contactsWithDept = apiResponse.data.contacts.map(contact => ({
            ...contact,
            ownerInfo: {
              ...contact.ownerInfo,
              departmentName: apiResponse.data.departmentName
            }
          }));
          
          setContacts(contactsWithDept);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching contacts:", err);
        setError("Failed to load contacts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [selectedDepartment]);    // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.name} ${contact.surname}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) ||
           contact.email.toLowerCase().includes(searchLower) ||
           contact.phone.includes(searchTerm) ||
           contact.howWeMet.toLowerCase().includes(searchLower) ||
           (contact.ownerInfo.departmentName && contact.ownerInfo.departmentName.toLowerCase().includes(searchLower));
  });
  
  // Get recent contacts - sort by creation date
  const recentContacts = [...filteredContacts]
    .sort((a, b) => b.createdAt._seconds - a.createdAt._seconds)
    .slice(0, 3);
  
  // For favorites, we'll just show the most recent contacts since the API doesn't have a favorite field
  const favoriteContacts = recentContacts;
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-description">Manage your network and connections</p>
        </div>
        {/* <div className="page-actions">
          <Button>
            <FaUserPlus className="mr-2" size={14} />
            Add Contact
          </Button>
        </div> */}
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
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="department-select">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.contactCount} contacts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="filter-button">
            Filter
          </Button>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading contacts...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <>            <TabsContent value="all" className="mt-4">
              <div className="contacts-list">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact, index) => (
                    <ContactItem key={`${contact.email}-${index}`} contact={contact} />
                  ))
                ) : (
                  <div className="no-results">No contacts found. Try adjusting your search.</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="contacts-list">
                {recentContacts.length > 0 ? (
                  recentContacts.map((contact, index) => (
                    <ContactItem key={`recent-${contact.email}-${index}`} contact={contact} />
                  ))
                ) : (
                  <div className="no-results">No recent contacts found.</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="favorites">
              <div className="contacts-list">
                {favoriteContacts.length > 0 ? (
                  favoriteContacts.map((contact, index) => (
                    <ContactItem key={`favorite-${contact.email}-${index}`} contact={contact} />
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

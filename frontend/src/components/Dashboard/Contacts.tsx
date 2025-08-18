import { useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaEllipsisV, FaTrash, FaBuilding, FaShare } from "react-icons/fa";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Card, CardContent } from "../UI/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/selectRadix";
import "../../styles/Contacts.css";
import "../../styles/Dashboard.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../UI/dropdown-menu";
import { buildEnterpriseUrl, getEnterpriseHeaders, ENDPOINTS, authenticatedFetch } from "../../utils/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../UI/dialog";

// Define contact interface based on API response
interface Contact {
  name: string;
  surname: string;
  phone: string;
  howWeMet: string;
  email: string;
  company?: string;
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

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch contacts from the API - extracted to be reusable
  const fetchContacts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching fresh contacts data from backend...');
      
      // Get all enterprise contacts with cache busting
      const baseUrl = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CONTACTS);
      const cacheBuster = `?_t=${Date.now()}`;
      const url = baseUrl + cacheBuster;
      console.log('🔄 Fetching from URL with cache buster:', url);
      
      const response = await fetch(url, {
        headers: getEnterpriseHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const apiResponse: EnterpriseContactsResponse = await response.json();
      console.log('📊 Fresh API response:', apiResponse);
      console.log('📊 contactsByDepartment:', apiResponse.data.contactsByDepartment);
      
      // Flatten all contacts from all departments
      const allContacts: Contact[] = [];
      Object.values(apiResponse.data.contactsByDepartment).forEach(dept => {
        console.log('📊 Processing department:', dept.departmentName, 'with contacts:', dept.contacts);
        // Add department name to each contact
        const contactsWithDept = dept.contacts.map(contact => ({
          ...contact,
          ownerInfo: {
            ...contact.ownerInfo,
            departmentName: dept.departmentName
          }
        }));
        console.log('📊 Contacts with dept name:', contactsWithDept);
        allContacts.push(...contactsWithDept);
      });
      
      console.log('✅ Setting fresh contacts data (total:', allContacts.length, '):', allContacts);
      setContacts(allContacts);
    } catch (err: any) {
      setError(err.message || "Failed to fetch contacts");
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };
    
  // Fetch contacts when component mounts or department changes
  useEffect(() => {
    fetchContacts();
  }, []);    // Filter contacts based on search term
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
  
  // Removed handleContactDeleted - we now refetch fresh data instead of manipulating local state

  const handleShareContact = (contact: Contact) => {
    const contactData = {
      name: `${contact.name} ${contact.surname}`,
      email: contact.email,
      phone: contact.phone,
      company: contact.company || 'N/A'
    };
    
    // Create shareable text
    const shareText = `Contact: ${contactData.name}\nEmail: ${contactData.email}\nPhone: ${contactData.phone}\nCompany: ${contactData.company}`;
    
    // Try to use native sharing API, fallback to clipboard
    if (navigator.share) {
      navigator.share({
        title: 'Contact Information',
        text: shareText
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        alert('Contact information copied to clipboard!');
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Contact information copied to clipboard!');
    }
  };

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      setIsDeleting(true);
      
      // FIXED: First get the user's contact array to find the correct index
      console.log('🔍 Getting user contact array to find contact index...');
      const getUserContactsResponse = await authenticatedFetch(`/Contacts/${contactToDelete.ownerInfo.userId}`, {
        method: 'GET',
      });

      if (!getUserContactsResponse.ok) {
        throw new Error(`Failed to get user contacts: ${getUserContactsResponse.status}`);
      }

      const userContactsData = await getUserContactsResponse.json();
      console.log('📋 User contacts data:', userContactsData);

      // Find the contact index by matching email, name, and surname (more reliable than timestamp formats)
      let contactIndex = -1;
      if (userContactsData.contactList && Array.isArray(userContactsData.contactList)) {
        contactIndex = userContactsData.contactList.findIndex((contact: any) => 
          contact.email === contactToDelete.email && 
          contact.name === contactToDelete.name &&
          contact.surname === contactToDelete.surname
        );
        
        console.log('🔍 Looking for contact:', {
          email: contactToDelete.email,
          name: contactToDelete.name,
          surname: contactToDelete.surname
        });
        
        console.log('🔍 Available contacts in user list:', userContactsData.contactList.map((c: any, i: number) => ({
          index: i,
          email: c.email,
          name: c.name,
          surname: c.surname
        })));
      }

      if (contactIndex === -1) {
        console.error('❌ Contact matching failed!');
        console.error('🔍 Searching for:', {
          email: contactToDelete.email,
          name: contactToDelete.name,
          surname: contactToDelete.surname
        });
        console.error('📋 Available in user list:', userContactsData.contactList);
        
        // Try to find by email only as fallback
        const emailOnlyIndex = userContactsData.contactList.findIndex((contact: any) => 
          contact.email === contactToDelete.email
        );
        
        if (emailOnlyIndex !== -1) {
          console.log('✅ Found contact by email only at index:', emailOnlyIndex);
          contactIndex = emailOnlyIndex;
        } else {
          throw new Error(`Contact not found in user's contact list. Looking for email: ${contactToDelete.email}, but user has: ${userContactsData.contactList.map((c: any) => c.email).join(', ')}`);
        }
      }

      // FIXED: Use the correct delete endpoint with contact index
      const endpoint = `/Contacts/${contactToDelete.ownerInfo.userId}/contact/${contactIndex}`;
      console.log('🗑️ Attempting to delete contact:', {
        contactName: `${contactToDelete.name} ${contactToDelete.surname}`,
        userId: contactToDelete.ownerInfo.userId,
        contactIndex: contactIndex,
        endpoint: endpoint
      });
      
      const response = await authenticatedFetch(endpoint, {
        method: 'DELETE',
      });

      console.log('🗑️ Delete response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🗑️ Delete failed with error:', errorText);
        throw new Error(`Failed to delete contact: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // CRITICAL FIX: Refetch fresh data from backend instead of just updating local state
      console.log('✅ Contact deleted successfully, refetching fresh data from backend...');
      setShowDeleteDialog(false);
      setContactToDelete(null);
      
      // Force refresh of contacts data from backend with cache busting
      console.log('🔄 Forcing fresh data fetch after deletion...');
      
      // Clear backend cache first to ensure fresh data
      try {
        console.log('🧹 Clearing backend cache before fetching fresh data...');
        await authenticatedFetch('/api/cache/clear', { method: 'DELETE' });
        console.log('✅ Backend cache cleared successfully');
      } catch (cacheError) {
        console.warn('⚠️ Failed to clear backend cache:', cacheError);
      }
      
      await fetchContacts();
      
      // Show success message
      alert(`✅ Successfully deleted contact: ${contactToDelete.name} ${contactToDelete.surname}`);
    } catch (error) {
      console.error('Error deleting contact:', error);
      
      // Show more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          alert('❌ Unauthorized: You do not have permission to delete this contact.');
        } else if (error.message.includes('404')) {
          alert('❌ Contact not found: The contact may have already been deleted or the endpoint is incorrect.');
        } else if (error.message.includes('403')) {
          alert('❌ Forbidden: You do not have permission to delete contacts.');
        } else {
          alert(`❌ Failed to delete contact: ${error.message}`);
        }
      } else {
        alert('❌ Failed to delete contact. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setContactToDelete(null);
  };

  const formatDate = (createdAt: { _seconds: number; _nanoseconds: number }) => {
    const date = new Date(createdAt._seconds * 1000);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    // Add ordinal suffix
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  const getInitials = (name: string, surname: string) => {
    return `${name[0] || ''}${surname[0] || ''}`.toUpperCase();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Company', 'Email', 'Phone', 'Added', 'How We Met', 'Source'],
      ...filteredContacts.map(contact => [
        `${contact.name} ${contact.surname}`,
        contact.company || 'N/A',
        contact.email,
        contact.phone,
        formatDate(contact.createdAt),
        contact.howWeMet || '',
        'Exchanged'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportDropdown(false);
  };

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered...');
    setLoading(true);
    
    // Clear backend cache first to ensure fresh data
    try {
      console.log('🧹 Clearing backend cache before manual refresh...');
      await authenticatedFetch('/api/cache/clear', { method: 'DELETE' });
      console.log('✅ Backend cache cleared successfully');
    } catch (cacheError) {
      console.warn('⚠️ Failed to clear backend cache:', cacheError);
    }
    
    await fetchContacts();
  };
  
  return (
    <div className="contacts-container">
      {/* Header */}
      <div className="contacts-header">
        <h1 className="contacts-title">Contacts</h1>
        <div className="contacts-header-actions">
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            style={{ marginRight: '0.5rem' }}
          >
            🔄 Refresh
          </Button>
          <div className="export-dropdown">
            <Button 
              variant="outline" 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              style={{ marginRight: '0.5rem' }}
            >
              📤 Export contacts ▼
            </Button>
            {showExportDropdown && (
              <div className="export-dropdown-menu">
                <button onClick={handleExportCSV} className="export-option">
                  Export as CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="contacts-search-bar">
        <div className="search-input-wrapper">
            <Input 
              type="text" 
              placeholder="Search contacts..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
      {/* Table */}
        {loading ? (
          <div className="loading-state">Loading contacts...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
        <div className="contacts-table-container">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Added</th>
                <th>How We Met</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact, index) => (
                  <tr key={`${contact.email}-${index}`} className="contact-row">
                    <td className="name-cell">
                      <div className="contact-name-wrapper">
                        <div className="contact-avatar">
                          {getInitials(contact.name, contact.surname)}
              </div>
                        <span className="contact-full-name">
                          {contact.name} {contact.surname}
                        </span>
              </div>
                    </td>
                    <td className="company-cell">
                      {contact.company || 'N/A'}
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${contact.email}`} className="email-link">
                        {contact.email}
                      </a>
                    </td>
                    <td className="added-cell">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="how-we-met-cell">
                      {contact.howWeMet || '-'}
                    </td>
                    <td className="source-cell">
                      <span className="source-badge">
                        📱 Exchanged
                      </span>
                    </td>
                    <td className="actions-cell">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="action-button">
                            <FaEllipsisV />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dropdown-content">
                          <DropdownMenuItem onClick={() => handleShareContact(contact)}>
                            <FaShare className="action-icon" />
                            <span>Share</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(contact)}>
                            <FaTrash className="action-icon" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                  ))
                ) : (
                <tr>
                  <td colSpan={6} className="no-results">
                    No contacts found. Try adjusting your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
              </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">⚠️ Delete Contact</DialogTitle>
            <DialogDescription>
              <p className="mb-2">
                Are you sure you want to delete <strong>{contactToDelete ? `${contactToDelete.name} ${contactToDelete.surname}` : ''}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Warning:</strong> This action cannot be undone. All contact information, 
                including email, phone, and meeting history will be permanently removed.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;

import { useState, useEffect } from "react";
import { FaEllipsisV, FaTrash, FaShare, FaEye, FaUser, FaBuilding } from "react-icons/fa";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Badge } from "../UI/badge";
// Removed unused imports: Card, CardContent, Tabs components, Select components
import "../../styles/Contacts.css";
import "../../styles/Dashboard.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../UI/dropdown-menu";
import { fetchAuthenticatedContacts, fetchUserContacts, deleteContactByIndex, buildEnterpriseUrl, getEnterpriseHeaders, fetchAllEmployees } from "../../utils/api";
import { calculateUserPermissions, type UserWithPermissions } from "../../utils/permissions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../UI/dialog";

// Define contact interface based on API response (simplified - no ownerInfo per requirements)
interface Contact {
  name: string;
  surname: string;
  phone: string;
  howWeMet?: string; // Made optional to match API response
  email: string;
  company?: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

// Enterprise Employee interface for user list view
interface EnterpriseEmployee {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  surname?: string;
  email: string;
  role?: string;
  departmentName?: string;
  departmentId?: string;
  status?: string;
  lastActive?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Contact cache for enterprise users
interface ContactCache {
  [userId: string]: {
      contacts: Contact[];
    timestamp: number;
    ttl: number;
  };
}

// Note: Removed unused interfaces (Department, EnterpriseContactsResponse, DepartmentContactsResponse)
// as we now use authenticated contact endpoints that return simpler structures

const Contacts = () => {
  // Original employee contact states
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionError, setPermissionError] = useState<string>('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  
  // Enterprise user list states
  const [isEnterpriseUser, setIsEnterpriseUser] = useState(false);
  const [employees, setEmployees] = useState<EnterpriseEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EnterpriseEmployee | null>(null);
  const [selectedEmployeeContacts, setSelectedEmployeeContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  
  // Simple contact cache (session-based, no persistence)
  const [contactsCache] = useState<ContactCache>({});
  
  // User role checking (safe and quick)
  const getUserRole = (): string => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.role || 'employee';
      }
    } catch (e) {
      console.warn('Failed to get user role:', e);
    }
    return 'employee'; // Default fallback
  };

  // Check if user is enterprise level (Admin/Manager) vs Employee
  const checkIfEnterpriseUser = (): boolean => {
    const role = getUserRole().toLowerCase();
    return role.includes('admin') || role.includes('manager') || role.includes('administrator');
  };

  // Fetch user permissions including individual overrides
  const fetchUserPermissions = async () => {
    try {
      // Get user data from localStorage for basic info
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.warn('No user data found, using default permissions');
        setUserPermissions([]);
        return;
      }

      const parsedData = JSON.parse(userData);
      const userId = parsedData.id || parsedData.userId;
      
      console.log('👤 Fetching latest user data from backend for permissions...');
      console.log('🔍 User ID from localStorage:', userId);
      console.log('🔍 User data from localStorage:', parsedData);

      // Fetch latest user data from backend to get updated individualPermissions
      const url = buildEnterpriseUrl(`/enterprise/x-spark-test/employees`);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
      const data = await response.json();
      
      // Find the current user in the employees list
      console.log('🔍 Looking for user with ID:', userId);
      console.log('🔍 Available employee IDs:', data.employees.map((emp: any) => ({ id: emp.id, email: emp.email })));
      
      const currentUser = data.employees.find((emp: any) => emp.id === userId);
      
      if (!currentUser) {
        console.warn('Current user not found in employees list, using localStorage data');
        console.log('🔍 Trying to find by email instead...');
        const userByEmail = data.employees.find((emp: any) => emp.email === parsedData.email);
        if (userByEmail) {
          console.log('✅ Found user by email:', userByEmail);
          // Use the user found by email
          const user: UserWithPermissions = {
            id: userByEmail.id,
            email: userByEmail.email,
            role: userByEmail.role,
            plan: 'enterprise',
            isEmployee: true,
            individualPermissions: userByEmail.individualPermissions || { removed: [], added: [] }
          };
          const effectivePermissions = calculateUserPermissions(user);
          setUserPermissions(effectivePermissions);
          return;
        }
        // Fallback to localStorage data
        const user: UserWithPermissions = {
          id: userId,
          email: parsedData.email,
          role: parsedData.role,
          plan: 'enterprise',
          isEmployee: true,
          individualPermissions: parsedData.individualPermissions || { removed: [], added: [] }
        };
        const effectivePermissions = calculateUserPermissions(user);
        setUserPermissions(effectivePermissions);
            return;
          }
          
      console.log('👤 Latest user data from backend:', {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        individualPermissions: currentUser.individualPermissions
      });

      // Create user object for permission calculation with latest data
      const user: UserWithPermissions = {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        plan: 'enterprise',
        isEmployee: true,
        individualPermissions: currentUser.individualPermissions || { removed: [], added: [] }
      };

      console.log('🔍 Calculating permissions for user:', user);

      // Calculate effective permissions
      const effectivePermissions = calculateUserPermissions(user);
      console.log('✅ Effective permissions:', effectivePermissions);

      setUserPermissions(effectivePermissions);
    } catch (error) {
      console.error('❌ Error fetching user permissions:', error);
      setUserPermissions([]);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  // Fetch enterprise employees for Admin/Manager view
  const fetchEnterpriseEmployees = async () => {
    try {
      setEmployeesLoading(true);
      console.log('🏢 Fetching enterprise employees for admin/manager view...');
      
      const response = await fetchAllEmployees();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch employees');
      }
      
      const employeesList = response.data.employees || [];
      console.log('👥 Fetched employees:', employeesList.length, 'employees');
      
      // Debug: Check for duplicate IDs
      const employeeIds = employeesList.map(emp => emp.id);
      const uniqueIds = new Set(employeeIds);
      if (employeeIds.length !== uniqueIds.size) {
        console.warn('⚠️ Duplicate employee IDs detected:', {
          total: employeeIds.length,
          unique: uniqueIds.size,
          duplicates: employeeIds.filter((id, index) => employeeIds.indexOf(id) !== index)
        });
      }
      
      setEmployees(employeesList);
    } catch (error) {
      console.error('❌ Error fetching enterprise employees:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch employees');
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Fetch contacts for specific employee (with caching)
  const fetchEmployeeContacts = async (employee: EnterpriseEmployee) => {
    try {
      setContactsLoading(true);
      
      // Check cache first (simple session cache)
      const cacheKey = employee.id;
      const cached = contactsCache[cacheKey];
      const now = Date.now();
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
      
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        console.log('📦 Using cached contacts for employee:', employee.email);
        setSelectedEmployeeContacts(cached.contacts);
        setContactsLoading(false);
        return;
      }
      
      console.log('🔍 Fetching contacts for employee:', employee.email);
      
      const response = await fetchUserContacts(employee.id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch employee contacts');
      }
      
      const employeeContacts = response.contactList || [];
      console.log('📋 Fetched contacts for', employee.email, ':', employeeContacts.length, 'contacts');
      
      // Cache the results
      contactsCache[cacheKey] = {
        contacts: employeeContacts,
        timestamp: now,
        ttl: CACHE_TTL
      };
      
      setSelectedEmployeeContacts(employeeContacts);
    } catch (error) {
      console.error('❌ Error fetching employee contacts:', error);
      setSelectedEmployeeContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };
  
  // Fetch contacts from the API - using authenticated endpoints
    const fetchContacts = async () => {
      try {
        setLoading(true);
      console.log('🔄 Fetching authenticated contacts data from backend...');
      
      // Optional role checking (safe and quick)
      const userRole = getUserRole();
      console.log('👤 User role:', userRole);
      
      const response = await fetchAuthenticatedContacts();
      console.log('📊 Authenticated API response:', response);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch contacts");
      }
      
      // Extract contacts from response
      let allContacts: Contact[] = [];
      if (response.contacts && response.contacts.length > 0) {
        // Check if contacts array contains contact objects directly or nested structure
        const firstContact = response.contacts[0];
        if (firstContact && typeof firstContact === 'object' && 'name' in firstContact) {
          // Direct contact objects: [{ name: "...", surname: "...", ... }]
          allContacts = response.contacts as Contact[];
        } else if (firstContact && typeof firstContact === 'object' && 'contactList' in firstContact) {
          // Nested structure: [{ id: "userId", contactList: [...] }]
          allContacts = (firstContact as any).contactList || [];
        }
      } else if (response.contactList) {
        // Alternative response format with direct contactList
        allContacts = response.contactList;
      }
      
      console.log('🔍 Extracted contacts structure:', {
        contactsCount: allContacts.length,
        firstContact: allContacts[0],
        hasName: allContacts[0]?.name,
        hasSurname: allContacts[0]?.surname
      });
      
      console.log('✅ Setting authenticated contacts data (total:', allContacts.length, '):', allContacts);
      
      // Debug: Log the first contact's createdAt field
      if (allContacts.length > 0) {
        console.log('🔍 First contact createdAt field:', {
          contact: allContacts[0].name + ' ' + allContacts[0].surname,
          createdAt: allContacts[0].createdAt,
          type: typeof allContacts[0].createdAt,
          keys: allContacts[0].createdAt ? Object.keys(allContacts[0].createdAt) : 'null/undefined'
        });
      }
      
      setContacts(allContacts);
      
      // Cache contacts for performance - using the state-based cache
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          const userId = parsedData.id || parsedData.userId;
          if (userId) {
            const now = Date.now();
            const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
            contactsCache[userId] = {
              contacts: allContacts,
              timestamp: now,
              ttl: CACHE_TTL
            };
            console.log('📦 Cached contacts for user:', userId, allContacts.length, 'contacts');
          }
        } catch (e) {
          console.warn('Failed to cache contacts:', e);
        }
      }
    } catch (err: any) {
      console.error("Error fetching authenticated contacts:", err);
      
      // Handle specific authentication errors
      if (err.message?.includes('Access denied') || err.message?.includes('403')) {
        setPermissionError("You can only view your own contacts. Please make sure you're logged in with the correct account.");
        setShowPermissionModal(true);
      } else if (err.message?.includes('Authentication required') || err.message?.includes('401')) {
        setPermissionError("Authentication required. Please log in again to access your contacts.");
        setShowPermissionModal(true);
      } else {
        setError(err.message || "Failed to fetch contacts");
      }
      } finally {
        setLoading(false);
      }
    };
    
  // Initialize component based on user role
  useEffect(() => {
    const isEnterprise = checkIfEnterpriseUser();
    setIsEnterpriseUser(isEnterprise);
    
    console.log('🔍 User role detection:', {
      role: getUserRole(),
      isEnterprise,
      viewMode: isEnterprise ? 'Enterprise User List' : 'Employee Contacts'
    });
    
    // Load appropriate data based on user type
    if (isEnterprise) {
      // Admin/Manager: Load employee list
      fetchEnterpriseEmployees();
    } else {
      // Employee: Load their own contacts
    fetchContacts();
    }
    
    // Always load user permissions
    fetchUserPermissions();
  }, []);
  
  // Filter contacts based on search term (for employee view)
  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.name} ${contact.surname}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) ||
           contact.email.toLowerCase().includes(searchLower) ||
           contact.phone.includes(searchTerm) ||
           (contact.howWeMet && contact.howWeMet.toLowerCase().includes(searchLower)) ||
           (contact.company && contact.company.toLowerCase().includes(searchLower));
  });

  // Filter employees based on search term and role filter (for enterprise view)
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName || employee.name || ''} ${employee.lastName || employee.surname || ''}`.toLowerCase();
    const email = employee.email.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const department = (employee.departmentName || '').toLowerCase();
    
    // Text search
    const matchesSearch = fullName.includes(searchLower) ||
                         email.includes(searchLower) ||
                         department.includes(searchLower);
    
    // Role filter
    const matchesRole = roleFilter === 'All' || 
                       (employee.role && employee.role.toLowerCase().includes(roleFilter.toLowerCase()));
    
    return matchesSearch && matchesRole;
  });

  // Handle opening contacts modal for specific employee
  const handleRevealContacts = async (employee: EnterpriseEmployee) => {
    setSelectedEmployee(employee);
    setContactsModalOpen(true);
    await fetchEmployeeContacts(employee);
  };

  // Handle closing contacts modal
  const handleCloseContactsModal = () => {
    setContactsModalOpen(false);
    setSelectedEmployee(null);
    setSelectedEmployeeContacts([]);
  };
  
  // Note: Removed recentContacts variable as it was unused
  
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
      
      // Get current user ID from localStorage
      const userData = localStorage.getItem('userData');
      let userId = '';
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          userId = parsedData.id || parsedData.userId;
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      console.log('🔍 Getting user contact array to find contact index...');
      
      // First get the user's contact list to find the correct index
      const userContactsResponse = await fetchUserContacts(userId);
      
      if (!userContactsResponse.success) {
        throw new Error(userContactsResponse.message || 'Failed to get user contacts');
      }

      const userContactList = userContactsResponse.contactList || [];
      console.log('📋 User contacts data:', userContactList);

      // Find the contact index by matching email, name, and surname
      let contactIndex = -1;
      if (Array.isArray(userContactList)) {
        contactIndex = userContactList.findIndex((contact: any) => 
          contact.email === contactToDelete.email && 
          contact.name === contactToDelete.name &&
          contact.surname === contactToDelete.surname
        );
        
        console.log('🔍 Looking for contact:', {
          email: contactToDelete.email,
          name: contactToDelete.name,
          surname: contactToDelete.surname
        });
        
        console.log('🔍 Available contacts in user list:', userContactList.map((c: any, i: number) => ({
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
        console.error('📋 Available in user list:', userContactList);
        
        // Try to find by email only as fallback
        const emailOnlyIndex = userContactList.findIndex((contact: any) => 
          contact.email === contactToDelete.email
        );
        
        if (emailOnlyIndex !== -1) {
          console.log('✅ Found contact by email only at index:', emailOnlyIndex);
          contactIndex = emailOnlyIndex;
        } else {
          throw new Error(`Contact not found in user's contact list. Looking for email: ${contactToDelete.email}, but user has: ${userContactList.map((c: any) => c.email).join(', ')}`);
        }
      }

      console.log('🗑️ Attempting to delete contact:', {
        contactName: `${contactToDelete.name} ${contactToDelete.surname}`,
        userId: userId,
        contactIndex: contactIndex
      });
      
      // Use the new authenticated delete function
      const deleteResponse = await deleteContactByIndex(userId, contactIndex);

      console.log('🗑️ Delete response:', deleteResponse);

      if (!deleteResponse.success) {
        throw new Error(deleteResponse.message || 'Failed to delete contact');
      }

      // Contact deleted successfully
      console.log('✅ Contact deleted successfully, refetching fresh data from backend...');
      setShowDeleteDialog(false);
      setContactToDelete(null);
      
      // Refresh contacts data from backend
      await fetchContacts();
      
      // Show success message
      alert(`✅ Successfully deleted contact: ${contactToDelete.name} ${contactToDelete.surname}`);
    } catch (error) {
      console.error('Error deleting contact:', error);
      
      // Show more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Authentication required') || error.message.includes('User ID not found')) {
          setPermissionError("Authentication required. Please log in again to delete contacts.");
          setShowPermissionModal(true);
        } else if (error.message.includes('Access denied')) {
          setPermissionError("You can only delete your own contacts. Please make sure you're logged in with the correct account.");
          setShowPermissionModal(true);
        } else if (error.message.includes('Contact not found')) {
          alert('❌ Contact not found: The contact may have already been deleted.');
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

  const formatDate = (createdAt: any) => {
    try {
      console.log('🔍 Formatting date with input:', createdAt, 'Type:', typeof createdAt);
      
      // Handle different possible date formats
      let date: Date = new Date(); // Default fallback
      
      if (typeof createdAt === 'object' && createdAt._seconds) {
        // Firebase timestamp format
        date = new Date(createdAt._seconds * 1000);
        console.log('📅 Firebase timestamp detected:', createdAt._seconds);
      } else if (typeof createdAt === 'number') {
        // Unix timestamp in seconds
        date = new Date(createdAt * 1000);
        console.log('📅 Unix timestamp detected:', createdAt);
      } else if (typeof createdAt === 'string') {
        // Handle malformed date strings like "August 18 2025 at at 11:46:46 AM GMT+2"
        let cleanDateString = createdAt;
        
        // Fix double "at" issue
        if (cleanDateString.includes(' at at ')) {
          cleanDateString = cleanDateString.replace(' at at ', ' at ');
          console.log('🔧 Fixed double "at" in date string:', cleanDateString);
        }
        
        // Try multiple parsing strategies
        let parsedDate: Date | null = null;
        
        // Strategy 1: Try the cleaned string directly
        parsedDate = new Date(cleanDateString);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate;
          console.log('📅 Strategy 1 succeeded - direct parsing:', cleanDateString);
        } else {
          // Strategy 2: Try to extract date parts manually
          console.log('📅 Strategy 1 failed, trying manual parsing...');
          
          // Extract month, day, year from "August 18 2025 at 11:46:46 AM GMT+2"
          const match = cleanDateString.match(/(\w+)\s+(\d+)\s+(\d{4})/);
          if (match) {
            const [, monthStr, dayStr, yearStr] = match;
            const month = monthStr.toLowerCase();
            const day = parseInt(dayStr);
            const year = parseInt(yearStr);
            
            // Convert month name to number
            const monthMap: { [key: string]: number } = {
              'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
              'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
            };
            
            if (monthMap[month] !== undefined) {
              parsedDate = new Date(year, monthMap[month], day);
              if (!isNaN(parsedDate.getTime())) {
                date = parsedDate;
                console.log('📅 Strategy 2 succeeded - manual parsing:', `${month} ${day}, ${year}`);
              }
            }
          }
        }
        
        // If all strategies failed, use the default fallback date
        if (!parsedDate || isNaN(parsedDate.getTime())) {
          console.warn('❌ All date parsing strategies failed for:', cleanDateString);
          console.log('📅 Using fallback date (current date)');
        } else {
          date = parsedDate;
        }
        
        console.log('📅 String date detected:', cleanDateString);
      } else {
        console.warn('❌ Unknown date format:', createdAt);
        return 'Unknown date';
      }
      
      console.log('📅 Created Date object:', date, 'Valid:', !isNaN(date.getTime()));
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('❌ Invalid date from input:', createdAt);
        return 'Invalid date';
      }
      
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
    
      const formattedDate = `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
      console.log('✅ Formatted date:', formattedDate);
      return formattedDate;
    } catch (error) {
      console.error('❌ Error formatting date:', error, 'Input:', createdAt);
      return 'Date error';
    }
  };

  const getInitials = (name: string, surname: string) => {
    // Add null/undefined checks to prevent errors
    const firstName = name || '';
    const lastName = surname || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
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
    if (isEnterpriseUser) {
      await fetchEnterpriseEmployees();
    } else {
    await fetchContacts();
    }
  };
  
  return (
    <div className="contacts-container">
      {/* Header */}
      <div className="contacts-header">
        <h1 className="contacts-title">
          {isEnterpriseUser ? 'Enterprise Contacts' : 'My Contacts'}
        </h1>
        <div className="contacts-header-actions">
          <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            style={{ marginRight: '0.5rem' }}
          >
            🔄 Refresh
          </Button>

          {!isEnterpriseUser && (
          <div className="export-dropdown">
            <Button 
              variant="outline" 
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              style={{ marginRight: '0.5rem' }}
                disabled={!hasPermission('exportContacts')}
            >
              📤 Export contacts ▼
            </Button>
              {showExportDropdown && hasPermission('exportContacts') && (
              <div className="export-dropdown-menu">
                <button onClick={handleExportCSV} className="export-option">
                  Export as CSV
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="contacts-search-bar">
        <div className="search-input-wrapper">
            <Input 
              type="text" 
            placeholder={isEnterpriseUser ? "Search employees..." : "Search contacts..."} 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        
        {isEnterpriseUser && (
          <div style={{ marginLeft: '1rem' }}>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-control"
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Administrators</option>
              <option value="Manager">Managers</option>
              <option value="Employee">Employees</option>
            </select>
          </div>
        )}
        </div>
        
      {/* Content Area */}
      {isEnterpriseUser ? (
        /* Enterprise User View - Employee List */
        employeesLoading ? (
          <div className="loading-state">Loading employees...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <div className="contacts-table-container">
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee, index) => (
                    <tr key={`${employee.id}-${employee.email}-${index}`} className="contact-row">
                      <td className="name-cell">
                        <div className="contact-name-wrapper">
                          <div className="contact-avatar">
                            {getInitials(
                              employee.firstName || employee.name || '', 
                              employee.lastName || employee.surname || ''
                            )}
                          </div>
                          <span className="contact-full-name">
                            {employee.firstName || employee.name || 'Unknown'} {employee.lastName || employee.surname || ''}
                          </span>
                        </div>
                      </td>
                      <td className="role-cell">
                        <Badge variant="secondary">
                          {employee.role || 'Employee'}
                        </Badge>
                      </td>
                      <td className="department-cell">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <FaBuilding style={{ marginRight: '0.5rem', color: '#64748b' }} />
                          {employee.departmentName || 'No Department'}
                        </div>
                      </td>
                      <td className="email-cell">
                        <a href={`mailto:${employee.email}`} className="email-link">
                          {employee.email}
                        </a>
                      </td>
                      <td className="status-cell">
                        <Badge variant={employee.isActive !== false ? "default" : "secondary"}>
                          {employee.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="actions-cell">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="action-button">
                              <FaEllipsisV />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dropdown-content">
                            <DropdownMenuItem onClick={() => handleRevealContacts(employee)}>
                              <FaEye className="action-icon" />
                              <span>Reveal Contacts</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="no-results">
                      No employees found. Try adjusting your search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Employee View - Own Contacts */
        loading ? (
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
                    <tr key={`${contact.email}-${contact.name}-${contact.surname}-${index}`} className="contact-row">
                    <td className="name-cell">
                      <div className="contact-name-wrapper">
                        <div className="contact-avatar">
                            {getInitials(contact.name || '', contact.surname || '')}
              </div>
                        <span className="contact-full-name">
                            {contact.name || 'Unknown'} {contact.surname || ''}
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
                        {contact.createdAt ? formatDate(contact.createdAt) : 'Unknown date'}
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
                            <DropdownMenuItem 
                              onClick={() => hasPermission('shareContacts') && handleShareContact(contact)}
                              className={!hasPermission('shareContacts') ? 'disabled-menu-item' : ''}
                              style={!hasPermission('shareContacts') ? { 
                                opacity: 0.4, 
                                cursor: 'not-allowed',
                                pointerEvents: 'none',
                                color: '#9ca3af',
                                backgroundColor: '#f9fafb'
                              } : {}}
                            >
                            <FaShare className="action-icon" />
                            <span>Share</span>
                          </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => hasPermission('deleteContacts') && handleDeleteClick(contact)}
                              className={!hasPermission('deleteContacts') ? 'disabled-menu-item' : ''}
                              style={!hasPermission('deleteContacts') ? { 
                                opacity: 0.4, 
                                cursor: 'not-allowed',
                                pointerEvents: 'none',
                                color: '#9ca3af',
                                backgroundColor: '#f9fafb'
                              } : {}}
                            >
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
                    <td colSpan={7} className="no-results">
                    No contacts found. Try adjusting your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
              </div>
        )
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

      {/* Permission Error Modal */}
      <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">🔒 Access Restricted</DialogTitle>
            <DialogDescription>
              <p className="mb-4">
                {permissionError}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> With the new contact permissions system, you can only view and manage your own contacts for privacy and security reasons.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionModal(false)}>
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Contacts Modal */}
      <Dialog open={contactsModalOpen} onOpenChange={setContactsModalOpen}>
        <DialogContent className="max-w-none w-[98vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Contacts for {selectedEmployee ? 
                `${selectedEmployee.firstName || selectedEmployee.name || ''} ${selectedEmployee.lastName || selectedEmployee.surname || ''}` 
                : 'Employee'
              }
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaUser style={{ color: '#64748b' }} />
                    <span>{selectedEmployee.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaBuilding style={{ color: '#64748b' }} />
                    <span>{selectedEmployee.departmentName || 'No Department'}</span>
                  </div>
                  <Badge variant="secondary">
                    {selectedEmployee.role || 'Employee'}
                  </Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'auto' }}>
            {contactsLoading ? (
              <div className="loading-state">Loading contacts...</div>
            ) : selectedEmployeeContacts.length > 0 ? (
              <div className="contacts-table-container" style={{ minWidth: '1200px' }}>
                <table className="contacts-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="company-header">Company</th>
                      <th className="email-header">Email</th>
                      <th className="added-header">Added</th>
                      <th className="how-we-met-header">How We Met</th>
                      <th className="source-header">Source</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEmployeeContacts.map((contact, index) => (
                      <tr key={`${contact.email}-${contact.name}-${contact.surname}-${index}`} className="contact-row">
                        <td className="name-cell">
                          <div className="contact-name-wrapper">
                            <div className="contact-avatar">
                              {getInitials(contact.name || '', contact.surname || '')}
                            </div>
                            <span className="contact-full-name">
                              {contact.name || 'Unknown'} {contact.surname || ''}
                            </span>
                          </div>
                        </td>
                        <td className="company-cell company-header">
                          {contact.company || 'N/A'}
                        </td>
                        <td className="email-cell email-header">
                          <a href={`mailto:${contact.email}`} className="email-link">
                            {contact.email}
                          </a>
                        </td>
                        <td className="added-cell added-header">
                          {contact.createdAt ? formatDate(contact.createdAt) : 'Unknown date'}
                        </td>
                        <td className="how-we-met-cell how-we-met-header">
                          {contact.howWeMet || '-'}
                        </td>
                        <td className="source-cell source-header">
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
                              <DropdownMenuItem 
                                onClick={() => hasPermission('shareContacts') && handleShareContact(contact)}
                                className={!hasPermission('shareContacts') ? 'disabled-menu-item' : ''}
                                style={!hasPermission('shareContacts') ? { 
                                  opacity: 0.4, 
                                  cursor: 'not-allowed',
                                  pointerEvents: 'none',
                                  color: '#9ca3af',
                                  backgroundColor: '#f9fafb'
                                } : {}}
                              >
                                <FaShare className="action-icon" />
                                <span>Share</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => hasPermission('deleteContacts') && handleDeleteClick(contact)}
                                className={!hasPermission('deleteContacts') ? 'disabled-menu-item' : ''}
                                style={!hasPermission('deleteContacts') ? { 
                                  opacity: 0.4, 
                                  cursor: 'not-allowed',
                                  pointerEvents: 'none',
                                  color: '#9ca3af',
                                  backgroundColor: '#f9fafb'
                                } : {}}
                              >
                                <FaTrash className="action-icon" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="contacts-table-container" style={{ minWidth: '1200px' }}>
                <table className="contacts-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="company-header">Company</th>
                      <th className="email-header">Email</th>
                      <th className="added-header">Added</th>
                      <th className="how-we-met-header">How We Met</th>
                      <th className="source-header">Source</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="no-results">
                        No contacts found for this employee.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseContactsModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;

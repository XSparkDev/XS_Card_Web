import React from "react";
import { useState, useEffect, useRef } from "react";
import { format, parse } from "date-fns";
import {
  MdAccessTime,
  MdLocationOn,
  MdPeople,
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdEvent,
  MdCreditCard,
  MdDelete,
  MdToday,
  MdErrorOutline,
  MdCheckCircle
} from "react-icons/md";
import '../../styles/Calendar.css';
import { ENDPOINTS, buildUrl, DEFAULT_USER_ID, getEnterpriseHeaders, updateUserPermissions, fetchUserPermissions } from "../../utils/api";
import { calculateUserPermissions, type UserWithPermissions } from "../../utils/permissions";

// Import UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../UI/card";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Calendar } from "../UI/calendarWeb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../UI/dialog";
import { Badge } from "../UI/badge";
import { Textarea } from "../UI/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../UI/selectRadix";

// Define interfaces for API data
interface Meeting {
  title: string;
  meetingWith: string;
  meetingWhen: string;
  endTime: {
    _seconds: number;
    _nanoseconds: number;
  };
  description: string;
  location: string;
  attendees: {
    email: string;
    name: string;
  }[];
  duration: number;
}

interface MeetingsResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    totalMeetings: number;
    meetings: Meeting[];
  };
}

// Time options
const timeOptions = [
  "12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM", "2:00 AM", "2:30 AM", 
  "3:00 AM", "3:30 AM", "4:00 AM", "4:30 AM", "5:00 AM", "5:30 AM", 
  "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", 
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", 
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", 
  "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"
];

// Duration options
const durationOptions = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
  { value: "480", label: "8 hours" },
];

// Event types
const eventTypes = ["distribution", "design", "inventory", "presentation"];

// Timezone options
const timezoneOptions = [
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (UTC+2)" },
  { value: "America/New_York", label: "New York (UTC-4)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-7)" },
  { value: "Europe/London", label: "London (UTC+1)" },
  { value: "Europe/Paris", label: "Paris (UTC+2)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10)" },
];

// Initial event form data
const initialEventFormData = {
  title: "",
  description: "",
  date: new Date(),
  startTime: "9:00 AM",
  duration: "60",
  location: "",
  type: "distribution",
  timezone: "Africa/Johannesburg",
  attendees: ""
};

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  // const [view, setView] = useState<"month" | "week" | "day">("month");
  const [eventFormData, setEventFormData] = useState(initialEventFormData);
  const [attendeeList, setAttendeeList] = useState<{name: string, email: string}[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleEventCount, setVisibleEventCount] = useState(5);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Permission states
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionError, setPermissionError] = useState<string>('');
  
  const today = new Date();
  const currentMonth = format(date || today, "MMMM yyyy");
  
  const filteredEvents = events.filter(event => {
    if (!date) return false;
    
    return event.date.getDate() === date.getDate() && 
           event.date.getMonth() === date.getMonth() && 
           event.date.getFullYear() === date.getFullYear();
  });
  
  // Get only the visible events based on the current count
  const visibleEvents = filteredEvents.slice(0, visibleEventCount);
  const hasMoreEvents = filteredEvents.length > visibleEventCount;
  
  // Extract event dates for the calendar indicators
  const eventDates = events.map(event => new Date(event.date));

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    // Check if the permission is in the effective permissions array
    // If it's there, the user has the permission
    const hasIt = userPermissions.includes(permission);
    
    // Additional safety check: if permissions are still loading, deny access
    if (permissionsLoading) {
      console.log(`🔐 Calendar hasPermission("${permission}") = false (permissions still loading)`, {
        userPermissions,
        permissionsLoading
      });
      return false;
    }
    
    console.log(`🔐 Calendar hasPermission("${permission}") = ${hasIt}`, {
      userPermissions,
      permissionsLoading
    });
    return hasIt;
  };



  // Fetch user permissions including individual overrides
  const fetchUserPermissionsFromAPI = async () => {
    try {
      setPermissionsLoading(true);
      
      // Get user data from localStorage for basic info
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.warn('No user data found, blocking access for security');
        setUserPermissions([]);
        return;
      }

      const parsedData = JSON.parse(userData);
      const userId = parsedData.id || parsedData.userId;
      
      console.log('👤 Fetching latest user data from backend for permissions...');
      console.log('🔍 User ID from localStorage:', userId);

      // Try to fetch permissions with retry logic
      let result;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          // Use the new fetchUserPermissions API function that properly handles calendar permissions
          result = await fetchUserPermissions(userId);
          if (result.success) {
            break; // Success, exit retry loop
          }
        } catch (error) {
          console.warn(`API call attempt ${retryCount + 1} failed:`, error);
        }
        
        retryCount++;
        if (retryCount <= maxRetries) {
          console.log(`Retrying API call (${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
             if (!result.success) {
         console.warn('Failed to fetch user permissions from API after retries, blocking access for security');
         console.warn('This prevents using potentially stale localStorage data that could bypass security restrictions');
         // For security, if API fails, deny all permissions rather than using potentially stale localStorage data
         setUserPermissions([]);
         setPermissionError("Unable to verify your permissions. Please refresh the page or contact your administrator.");
         setShowPermissionModal(true);
         return;
       }
      
      console.log('✅ Fetched user permissions from API:', result.data);
      
      // Merge individual permissions and calendar permissions
      const mergedIndividualPermissions = {
        removed: [
          ...(result.data.individualPermissions?.removed || []),
          ...(result.data.calendarPermissions?.removed || [])
        ],
        added: [
          ...(result.data.individualPermissions?.added || []),
          ...(result.data.calendarPermissions?.added || [])
        ]
      };
      
      console.log('🔄 Merged permissions:', mergedIndividualPermissions);

      // Create user object for permission calculation with merged permissions
      const user: UserWithPermissions = {
        id: result.data.user.id,
        email: result.data.user.email,
        role: result.data.user.role,
        plan: 'enterprise',
        isEmployee: true,
        individualPermissions: mergedIndividualPermissions
      };

      console.log('🔍 Calculating permissions for user:', user);

      // Calculate effective permissions
      const effectivePermissions = calculateUserPermissions(user);
      console.log('✅ Effective permissions:', effectivePermissions);
      console.log('🔍 createMeetings in effective permissions:', effectivePermissions.includes('createMeetings'));

             // Security check: Ensure we have valid permissions
       if (!effectivePermissions || effectivePermissions.length === 0) {
         console.warn('API returned empty permissions, blocking access for security');
         setUserPermissions([]);
         setPermissionError("Unable to verify your permissions. Please refresh the page or contact your administrator.");
         setShowPermissionModal(true);
         return;
       }
       
       setUserPermissions(effectivePermissions);
       console.log('✅ userPermissions state set to:', effectivePermissions);
       console.log('🔍 createMeetings permission check:', effectivePermissions.includes('createMeetings'));
    } catch (error) {
      console.error('❌ Error fetching user permissions:', error);
      setUserPermissions([]);
    } finally {
      setPermissionsLoading(false);
      console.log('✅ Permissions loading completed');
    }
  };

  // Function to load more events
  const handleLoadMore = () => {
    setVisibleEventCount(prev => prev + 5);
  };

  // Function to fetch events from API
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has permission to view calendar
      if (!hasPermission('viewCalendar')) {
        setPermissionError("You don't have permission to view the calendar. Please contact your administrator.");
        setShowPermissionModal(true);
        return;
      }
      
      // Use Firebase token authentication for meetings with the DEFAULT_USER_ID
      const url = buildUrl(ENDPOINTS.CREATE_MEETING + `/${DEFAULT_USER_ID}`);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch events';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data: MeetingsResponse = await response.json();
      
      if (data.success && data.data.meetings) {
        // Transform API meetings to the event format used in the component
        const transformedEvents = data.data.meetings.map(meeting => {
          // Parse the meetingWhen string to get start date and time
          // Example format: "May 14 2025 at at 10:18:00 PM GMT+2"
          const startDate = parseEventDate(meeting.meetingWhen);
          
          // Calculate end time from the seconds timestamp
          const endDate = new Date(meeting.endTime._seconds * 1000);
          
          // Extract time strings for display
          const startTimeStr = format(startDate, "h:mm a");
          const endTimeStr = format(endDate, "h:mm a");
          
          // Create the event object in the format expected by the component
          return {
            id: Math.random().toString(36).substr(2, 9), // Generate a unique ID
            title: meeting.title,
            date: startDate, // Use startDate as the event date
            time: `${startTimeStr} - ${endTimeStr}`,
            location: meeting.location,
            description: meeting.description,
            type: determineEventType(meeting.title.toLowerCase()), // Determine event type based on title
            attendees: meeting.attendees.map(attendee => attendee.name)
          };
        });
        
        console.log('Transformed events:', transformedEvents);
        setEvents(transformedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred while fetching events');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to parse the date string from the API
  const parseEventDate = (dateString: string): Date => {
    try {
      // Example format: "May 14 2025 at at 10:18:00 PM GMT+2"
      // First, clean up the string - remove double "at"
      const cleanedDateString = dateString.replace(' at at ', ' at ');
      
      // Try parsing with date-fns
      try {
        return parse(cleanedDateString, 'MMMM d yyyy at h:mm:ss a OOOO', new Date());
      } catch (parseError) {
        // If that fails, try a manual approach
        console.error('Parse error:', parseError);
        
        // Manual parsing as fallback
        const parts = cleanedDateString.split(' at ');
        const datePart = parts[0]; // "May 14 2025"
        const timePart = parts[1].split(' GMT')[0]; // "10:18:00 PM"
        
        const dateObj = new Date(`${datePart} ${timePart}`);
        return dateObj;
      }
    } catch (error) {
      console.error('Error parsing date:', error, dateString);
      return new Date(); // Fallback to current date
    }
  };
  
  // Add helper function to check if a date is in the past (before today)
  const isDateInPast = (dateToCheck: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  // Update isTimeInPastForToday function to fix time filtering
  const isTimeInPastForToday = (timeString: string): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Parse the time string (e.g., "9:30 AM")
    const [timeWithoutAmPm, amPm] = timeString.split(' ');
    const [hourStr, minuteStr] = timeWithoutAmPm.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    // Convert to 24-hour format
    if (amPm === 'PM' && hour < 12) {
      hour += 12;
    } else if (amPm === 'AM' && hour === 12) {
      hour = 0;
    }
    
    // Compare hours and minutes
    if (hour < currentHour) {
      return true;
    } else if (hour === currentHour && minute <= currentMinute) {
      return true;
    }
    
    return false;
  };

  // Update the determineEventType function to better categorize events
  const determineEventType = (titleOrDesc: string): string => {
    // Convert to lowercase for case-insensitive matching
    const text = titleOrDesc.toLowerCase();
    
    // Check for distribution-related keywords
    if (text.includes('distribution') || text.includes('card') || text.includes('cards') || 
        text.includes('handout') || text.includes('deliver')) {
      return 'distribution';
    } 
    // Check for design-related keywords
    else if (text.includes('design') || text.includes('template') || text.includes('artwork') || 
             text.includes('creative') || text.includes('layout')) {
      return 'design';
    } 
    // Check for inventory-related keywords
    else if (text.includes('inventory') || text.includes('stock') || text.includes('supply') || 
             text.includes('count') || text.includes('audit')) {
      return 'inventory';
    } 
    // Check for presentation/meeting-related keywords
    else if (text.includes('presentation') || text.includes('meeting') || text.includes('discussion') || 
             text.includes('conference') || text.includes('webinar')) {
      return 'presentation';
    }
    
    // Assign a type based on the first character of the title if no matches
    const firstChar = text.charCodeAt(0) % 4;
    const types = ['distribution', 'design', 'inventory', 'presentation'];
    return types[firstChar];
  };

  // Load events when component mounts or date changes
  useEffect(() => {
    fetchEvents();
  }, []);

  // Load user permissions when component mounts
  useEffect(() => {
    console.log('🔄 Calendar component mounted, loading permissions...');
    fetchUserPermissionsFromAPI();
  }, []);

  // Load draft event data from localStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('eventFormDraft');
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        
        // Convert string date back to Date object
        if (parsedDraft.date) {
          parsedDraft.date = new Date(parsedDraft.date);
        }
        
        setEventFormData(parsedDraft);
        
        // Load attendees if saved
        const savedAttendees = localStorage.getItem('eventFormAttendees');
        if (savedAttendees) {
          setAttendeeList(JSON.parse(savedAttendees));
        }
      }
    } catch (error) {
      console.error("Error loading draft event data:", error);
    }
  }, []);

  // Now fix the default time selection issue by updating the getDefaultTimeForToday function
  const getDefaultTimeForToday = (): string => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Round up to the nearest 30-minute increment
    let hour = currentHour;
    let minute = 0;
    
    if (currentMinute <= 30) {
      minute = 30;
    } else {
      hour = (currentHour + 1) % 24;
    }
    
    // Convert to 12-hour format with AM/PM
    let period = 'AM';
    if (hour >= 12) {
      period = 'PM';
      if (hour > 12) {
        hour -= 12;
      }
    }
    
    // Handle midnight
    if (hour === 0) {
      hour = 12;
      period = 'AM';
    }
    
    // Format time string
    return `${hour}:${minute === 0 ? '00' : minute} ${period}`;
  };

  // Update the useEffect hook to properly set the default time for today
  useEffect(() => {
    if (isAddEventOpen) {
      // If there's no saved draft, reset the form
      if (!localStorage.getItem('eventFormDraft')) {
        const selectedDate = date || new Date();
        const today = new Date();
        
        // Check if selected date is today
        const isToday = 
          selectedDate.getDate() === today.getDate() &&
          selectedDate.getMonth() === today.getMonth() &&
          selectedDate.getFullYear() === today.getFullYear();
        
        // Always set a default time - current/next hour for today, 9AM for other days
        const defaultTime = isToday ? getDefaultTimeForToday() : "9:00 AM";
        
        setEventFormData({
          ...initialEventFormData,
          date: selectedDate,
          startTime: defaultTime
        });
        setAttendeeList([]);
      }
      setFormErrors({});
      setFormSubmitted(false);
    }
  }, [isAddEventOpen, date]);

  // Save form data as draft when it changes
  useEffect(() => {
    if (isAddEventOpen) {
      try {
        // Create a copy for localStorage (Date objects need special handling)
        const draftToPersist = {
          ...eventFormData,
          date: eventFormData.date.toISOString()
        };
        
        localStorage.setItem('eventFormDraft', JSON.stringify(draftToPersist));
        
        // Also save attendees
        localStorage.setItem('eventFormAttendees', JSON.stringify(attendeeList));
      } catch (error) {
        console.error("Error saving draft event data:", error);
      }
    }
  }, [eventFormData, attendeeList, isAddEventOpen]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "distribution": return { bg: "#dbeafe", text: "#1e40af" }; // blue
      case "design": return { bg: "#f3e8ff", text: "#6b21a8" }; // purple
      case "inventory": return { bg: "#fef3c7", text: "#92400e" }; // amber
      case "presentation": return { bg: "#dcfce7", text: "#166534" }; // green
      default: return { bg: "#f3f4f6", text: "#374151" }; // gray
    }
  };
  
  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
  };

  // Handle event deletion
  const handleDeleteEvent = (event: any) => {
    setEventToDelete(event);
    setIsDeletingEvent(true);
  };

  // Add new function to actually perform the deletion
  const confirmDeleteEvent = async () => {
    try {
      // Find the meeting index in the API response
      const meetingIndex = events.findIndex(e => e.id === eventToDelete.id);
      
      if (meetingIndex === -1) {
        console.error('Could not find meeting index');
        setApiError('Could not find meeting index for deletion');
        setIsDeletingEvent(false);
        return;
      }
      
      // Create a copy of the current events to animate the deleted one
      const updatedEvents = [...events];
      const deletedEvent = {...updatedEvents[meetingIndex]};
      deletedEvent.isDeleting = true;
      updatedEvents[meetingIndex] = deletedEvent;
      
      // Update events state to trigger animation
      setEvents(updatedEvents);      // Use Firebase token authentication for meetings with the DEFAULT_USER_ID
      const url = buildUrl(`${ENDPOINTS.CREATE_MEETING}/${DEFAULT_USER_ID}/${meetingIndex}`);
      const headers = getEnterpriseHeaders();
      
      // Make API call
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete event';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Wait for animation to complete before removing from state
      setTimeout(() => {
        // Remove the deleted event from events array
        const filteredEvents = events.filter(e => e.id !== eventToDelete.id);
        setEvents(filteredEvents);
        
        // Close all dialogs
        setIsDeletingEvent(false);
        setSelectedEvent(null);
        
        // Show success message
        setApiError(null);
        setDeleteSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setDeleteSuccess(false);
        }, 3000);
      }, 300); // Match animation duration
      
    } catch (error) {
      console.error('Error deleting event:', error);
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred while deleting event');
      setIsDeletingEvent(false);
    }
  };

  // Cancel delete
  const cancelDeleteEvent = () => {
    setIsDeletingEvent(false);
    setEventToDelete(null);
  };

  const handleNextMonth = () => {
    if (date) {
      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setDate(nextMonth);
    } else {
      setDate(new Date());
    }
  };

  const handlePrevMonth = () => {
    if (date) {
      const prevMonth = new Date(date);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setDate(prevMonth);
    } else {
      setDate(new Date());
    }
  };

  const handleToday = () => {
    setDate(new Date());
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when it changes
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add attendee
  const handleAddAttendee = () => {
    const attendeeInput = eventFormData.attendees.trim();
    if (!attendeeInput) return;

    // Parse input for name and email
    // Format expected: "Name <email>" or just "email"
    const emailRegex = /<([^>]+)>$/;
    const emailMatch = attendeeInput.match(emailRegex);
    
    let name = "";
    let email = "";
    
    if (emailMatch) {
      email = emailMatch[1];
      name = attendeeInput.substring(0, attendeeInput.indexOf('<')).trim();
    } else if (attendeeInput.includes('@')) {
      email = attendeeInput;
      name = attendeeInput.split('@')[0]; // Use part before @ as name
    } else {
      name = attendeeInput;
    }
    
    if (email) {
      setAttendeeList(prev => [...prev, { name, email }]);
      setEventFormData(prev => ({ ...prev, attendees: "" }));
    }
  };

  // Handle remove attendee
  const handleRemoveAttendee = (index: number) => {
    setAttendeeList(prev => prev.filter((_, i) => i !== index));
  };

  // Handle scheduling from distribution items
  const handleScheduleDistribution = (title: string, count: number) => {
    console.log('🚨 SCHEDULE DISTRIBUTION BUTTON CLICKED!');
    console.log('   - Current userPermissions:', userPermissions);
    console.log('   - permissionsLoading:', permissionsLoading);
    console.log('   - hasPermission("createMeetings"):', hasPermission('createMeetings'));
    
    // Check if permissions are still loading
    if (permissionsLoading) {
      console.log('⚠️ Permissions still loading, preventing modal opening');
      setPermissionError("Permissions are still loading. Please wait a moment and try again.");
      setShowPermissionModal(true);
      return;
    }
    
    // Check if user has permission to create meetings
    if (!hasPermission('createMeetings')) {
      console.log('❌ User does not have createMeetings permission - BLOCKING SCHEDULE MODAL OPENING');
      setPermissionError("You don't have permission to create meetings. Please contact your administrator.");
      setShowPermissionModal(true);
      return;
    }
    
    console.log('✅ Permission check passed, opening schedule modal...');
    
    // Pre-populate the form with distribution info
    const selectedDate = date || new Date();
    const today = new Date();
    
    // Check if selected date is today
    const isToday = 
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();
    
    // Set default time based on whether it's today or another date
    const defaultTime = isToday ? getDefaultTimeForToday() : "9:00 AM";
    
    setEventFormData({
      ...initialEventFormData,
      date: selectedDate,
      startTime: defaultTime,
      title: `${title} Distribution`,
      description: `Distribution of ${count} business cards for ${title}.`,
      type: "distribution"
    });
    
    // Open the dialog
    setIsAddEventOpen(true);
  };

  // Validate form and return errors
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validate title
    if (!eventFormData.title.trim()) {
      errors.title = "Event title is required";
    }
    
    // Validate location
    if (!eventFormData.location.trim()) {
      errors.location = "Location is required";
    }
    
    // Validate date
    if (!eventFormData.date) {
      errors.date = "Date is required";
    }
    
    // Validate time (ensure it's a valid time)
    if (!eventFormData.startTime) {
      errors.startTime = "Start time is required";
    }
    
    // Validate duration
    if (!eventFormData.duration) {
      errors.duration = "Duration is required";
    }
    
    // Validate timezone
    if (!eventFormData.timezone) {
      errors.timezone = "Timezone is required";
    }
    
    // Validate attendee format if one is being added
    if (eventFormData.attendees.trim()) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!eventFormData.attendees.includes('@') || 
          (eventFormData.attendees.includes('<') && !emailRegex.test(eventFormData.attendees.match(/<([^>]+)>/)?.[1] || ''))) {
        errors.attendees = "Invalid attendee format. Use 'Name <email@example.com>' or just email";
      }
    }
    
    return errors;
  };

  // Clear saved draft data
  const clearEventDraft = () => {
    localStorage.removeItem('eventFormDraft');
    localStorage.removeItem('eventFormAttendees');
  };

  // Update handleSubmitEvent to show success toast
  const handleSubmitEvent = async () => {
    console.log('🚨 ATTEMPT TO CREATE MEETING DETECTED!');
    console.log('   - Current userPermissions:', userPermissions);
    console.log('   - permissionsLoading:', permissionsLoading);
    console.log('   - hasPermission("createMeetings"):', hasPermission('createMeetings'));
    
    // Reset any previous errors
    setApiError(null);
    
    // Check if permissions are still loading
    if (permissionsLoading) {
      console.log('⚠️ Permissions still loading, preventing meeting creation');
      setPermissionError("Permissions are still loading. Please wait a moment and try again.");
      setShowPermissionModal(true);
      return;
    }
    
    // Check if user has permission to create meetings
    if (!hasPermission('createMeetings')) {
      console.log('❌ User does not have createMeetings permission - BLOCKING MEETING CREATION');
      setPermissionError("You don't have permission to create meetings. Please contact your administrator.");
      setShowPermissionModal(true);
      return;
    }
    
    console.log('✅ Permission check passed, proceeding with meeting creation...');
    
    // Validate the form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormSubmitting(true);

    // Convert form data to required API format
    const startTime = eventFormData.startTime;
    const durationMinutes = parseInt(eventFormData.duration);
    
    // Create ISO date strings for start and end times
    const eventDate = eventFormData.date;
    const [startHour, startMinuteWithAmPm] = startTime.split(':');
    const [startMinute, amPm] = startMinuteWithAmPm.split(' ');
    
    let hour = parseInt(startHour);
    if (amPm === 'PM' && hour < 12) hour += 12;
    if (amPm === 'AM' && hour === 12) hour = 0;
    
    const startDateTime = new Date(
      eventDate.getFullYear(), 
      eventDate.getMonth(), 
      eventDate.getDate(), 
      hour, 
      parseInt(startMinute)
    );
    
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
    
    // Format for API payload
    const eventPayload = {
      title: eventFormData.title,
      description: eventFormData.description,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      duration: durationMinutes,
      location: eventFormData.location,
      timezone: eventFormData.timezone,
      attendees: attendeeList.map(attendee => ({
        name: attendee.name,
        email: attendee.email
      }))
    };
    
    console.log('Event data to submit:', eventPayload);
    
    try {      // Use Firebase token authentication for meetings
      const url = buildUrl(ENDPOINTS.MEETING_INVITE);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(eventPayload)
      });
      
      if (!response.ok) {
        // Handle different error statuses
        let errorMessage = 'Failed to create event';
        
        try {
          // Try to parse response JSON for error details
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      const eventResponse = await response.json();
      console.log('Event created successfully:', eventResponse);
      
      // Show success message
      setFormSubmitted(true);
      
      // Clear the draft after successful submission
      clearEventDraft();
      
      // Show create success toast
      setCreateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setCreateSuccess(false);
      }, 3000);
      
      // Close dialog after a brief delay to show success
      setTimeout(() => {
        setIsAddEventOpen(false);
        
        // Fetch updated events
        fetchEvents();
        
      }, 1500);
    } catch (error) {
      console.error('Error creating event:', error);
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Event card component
  const EventCard = ({ event }: { event: any }) => {
    const colors = getEventTypeColor(event.type);
    const cardClassName = `event-card ${event.isDeleting ? 'deleting' : ''}`;
    
    return (
      <button 
        className={cardClassName}
        onClick={() => handleViewEvent(event)}
      >
        <div className="event-card-header">
          <div>
            <h3 className="event-title">{event.title}</h3>
            <div className="event-details">
              <div className="event-detail">
                <MdAccessTime className="icon" />
                <span className="event-detail-text">{event.time}</span>
              </div>
              <div className="event-detail">
                <MdLocationOn className="icon" />
                <span className="event-detail-text">{event.location}</span>
              </div>
            </div>
          </div>
          <Badge 
            variant="outline" 
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Badge>
        </div>
        <div className="event-attendees">
          <MdPeople className="icon" />
          <span className="event-detail-text">
            {event.attendees.length} attendee{event.attendees.length !== 1 ? "s" : ""}
          </span>
        </div>
      </button>
    );
  };

  // Update the NoEvents component to check if date is in the past
  const NoEvents = () => (
    <div className="no-events">
      <MdEvent className="no-events-icon" />
      <h3 className="no-events-title">No events scheduled</h3>
      <p className="no-events-description">There are no events scheduled for this day.</p>
      {!isDateInPast(date || new Date()) && (
        <Button 
          type="button"
          className="header-button outline-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🚨 NO EVENTS ADD EVENT BUTTON CLICKED!');
            console.log('   - Current userPermissions:', userPermissions);
            console.log('   - permissionsLoading:', permissionsLoading);
            console.log('   - hasPermission("createMeetings"):', hasPermission('createMeetings'));
            
            // Check if permissions are still loading
            if (permissionsLoading) {
              console.log('⚠️ Permissions still loading, preventing modal opening');
              setPermissionError("Permissions are still loading. Please wait a moment and try again.");
              setShowPermissionModal(true);
              return;
            }
            
            // Check if user has permission to create meetings
            if (!hasPermission('createMeetings')) {
              console.log('❌ User does not have createMeetings permission - BLOCKING MODAL OPENING');
              setPermissionError("You don't have permission to create meetings. Please contact your administrator.");
              setShowPermissionModal(true);
              return;
            }
            
            console.log('✅ Permission check passed, opening modal...');
            
            // Reset form data
            const selectedDate = date || new Date();
            const today = new Date();
            
            // Check if selected date is today
            const isToday = 
              selectedDate.getDate() === today.getDate() &&
              selectedDate.getMonth() === today.getMonth() &&
              selectedDate.getFullYear() === today.getFullYear();
            
            // Set default time based on whether it's today or another date
            const defaultTime = isToday ? getDefaultTimeForToday() : "9:00 AM";
            
            setEventFormData({
              ...initialEventFormData,
              date: selectedDate,
              startTime: defaultTime
            });
            setAttendeeList([]);
            setIsAddEventOpen(true);
          }}
          disabled={!hasPermission('createMeetings') || permissionsLoading}
        >
          <MdAdd className="icon-add" />
          <span>Add Event</span>
        </Button>
      )}
    </div>
  );

  // Event type indicator
  const EventTypeIndicator = ({ color, label }: { color: string, label: string }) => (
    <div className="event-type-indicator">
      <div className="color-dot" style={{ backgroundColor: color }}></div>
      <span className="event-type-label">{label}</span>
    </div>
  );

  // Card distribution item
  const CardDistributionItem = ({ title, count }: { title: string, count: number }) => (
    <div className="distribution-item">
      <div className="distribution-item-left">
        <MdCreditCard className="icon-card" />
        <div>
          <p className="distribution-title">{title}</p>
          <p className="distribution-count">{count} cards pending distribution</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleScheduleDistribution(title, count)}
        disabled={!hasPermission('createMeetings') || permissionsLoading}
      >
        Schedule
      </Button>
    </div>
  );

  // Add function to handle clicks outside the date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current && 
        !datePickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.date-picker-button')
      ) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      // Use setTimeout to add the event listener after the current event loop
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  return (
    <div className="calendar-page">
      <div className="calendar-page-header">
        <div className="calendar-title">
          <h1>Calendar</h1>
          <p className="calendar-subtitle">Schedule and manage business card related events.</p>
          

        </div>
        <Button 
          className="header-button outline-button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🚨 ADD EVENT BUTTON CLICKED!');
            console.log('   - Current userPermissions:', userPermissions);
            console.log('   - permissionsLoading:', permissionsLoading);
            console.log('   - hasPermission("createMeetings"):', hasPermission('createMeetings'));
            
            // Check if permissions are still loading
            if (permissionsLoading) {
              console.log('⚠️ Permissions still loading, preventing modal opening');
              setPermissionError("Permissions are still loading. Please wait a moment and try again.");
              setShowPermissionModal(true);
              return;
            }
            
            // Check if user has permission to create meetings
            if (!hasPermission('createMeetings')) {
              console.log('❌ User does not have createMeetings permission - BLOCKING MODAL OPENING');
              setPermissionError("You don't have permission to create meetings. Please contact your administrator.");
              setShowPermissionModal(true);
              return;
            }
            
            console.log('✅ Permission check passed, opening modal...');
            
            // Reset form data when opening
            const selectedDate = date || new Date();
            const today = new Date();
            
            // Check if selected date is today
            const isToday = 
              selectedDate.getDate() === today.getDate() &&
              selectedDate.getMonth() === today.getMonth() &&
              selectedDate.getFullYear() === today.getFullYear();
            
            // Set default time based on whether it's today or another date
            const defaultTime = isToday ? getDefaultTimeForToday() : "9:00 AM";
            
            setEventFormData({
              ...initialEventFormData,
              date: selectedDate,
              startTime: defaultTime
            });
            setAttendeeList([]);
            setIsAddEventOpen(true);
          }}
          disabled={isDateInPast(date || new Date()) || !hasPermission('createMeetings') || permissionsLoading}
          type="button"
        >
          <MdAdd className="icon-add" />
          Add Event
        </Button>
      </div>
      
      <div className="calendar-layout">
        <div className="calendar-sidebar">
          <Card>
            <CardContent className="calendar-widget">
              <div className="calendar-header">
                <button 
                  type="button"
                  className="icon-button" 
                  onClick={handlePrevMonth}
                >
                  <MdChevronLeft />
                </button>
                <span className="current-month">{currentMonth}</span>
                <button 
                  type="button"
                  className="icon-button" 
                  onClick={handleNextMonth}
                >
                  <MdChevronRight />
                </button>
              </div>
              
              <Calendar
                selectedDate={date}
                onDateSelect={setDate}
                events={eventDates}
              />
              
              <button 
                type="button"
                className="today-button" 
                onClick={handleToday}
              >
                <MdToday className="today-icon" />
                <span>Today</span>
              </button>
            </CardContent>
          </Card>
          
          <Card className="event-types-card">
            <CardHeader>
              <CardTitle>Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <EventTypeIndicator color="#2563eb" label="Distribution" />
              <EventTypeIndicator color="#7c3aed" label="Design Review" />
              <EventTypeIndicator color="#d97706" label="Inventory" />
              <EventTypeIndicator color="#059669" label="Presentation" />
            </CardContent>
          </Card>
          
          <Card className="upcoming-events-card">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`upcoming-events-list ${showAllUpcoming ? 'show-all' : ''}`}>
                {events
                  .filter(event => {
                    const eventDate = new Date(event.date);
                    const now = new Date();
                    // Only include future events or events today but not in the past
                    if (eventDate.getDate() === now.getDate() &&
                        eventDate.getMonth() === now.getMonth() &&
                        eventDate.getFullYear() === now.getFullYear()) {
                      // For today, parse the time to check if it's in the future
                      const timeString = event.time.split(' - ')[0]; // Get start time
                      return !isTimeInPastForToday(timeString);
                    }
                    return eventDate >= now;
                  })
                  .slice(0, showAllUpcoming ? undefined : 3)
                  .map(event => (
                    <div key={event.id} className="upcoming-event" onClick={() => handleViewEvent(event)}>
                      <p className="upcoming-event-title">{event.title}</p>
                      <p className="upcoming-event-date">
                        {format(event.date, "MMM d")} • {event.time}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="view-all-button"
                onClick={() => setShowAllUpcoming(!showAllUpcoming)}
              >
                {showAllUpcoming ? 'Show Less' : 'View All'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="calendar-content">
          <Card className="events-card">
            <CardHeader className="events-card-header">
              <div>
                <CardTitle>Events for {date ? format(date, "MMMM d, yyyy") : "Today"}</CardTitle>
                <CardDescription>
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} scheduled
                </CardDescription>
              </div>
              {/* <div className="view-toggle">
                <button 
                  type="button"
                  className={`view-toggle-button ${view === "month" ? "view-toggle-button-active" : ""}`}
                  onClick={() => setView("month")}
                >
                  <span className={`view-toggle-text ${view === "month" ? "view-toggle-text-active" : ""}`}>Month</span>
                </button>
                <button 
                  type="button"
                  className={`view-toggle-button ${view === "week" ? "view-toggle-button-active" : ""}`}
                  onClick={() => setView("week")}
                >
                  <span className={`view-toggle-text ${view === "week" ? "view-toggle-text-active" : ""}`}>Week</span>
                </button>
                <button 
                  type="button"
                  className={`view-toggle-button ${view === "day" ? "view-toggle-button-active" : ""}`}
                  onClick={() => setView("day")}
                >
                  <span className={`view-toggle-text ${view === "day" ? "view-toggle-text-active" : ""}`}>Day</span>
                </button>
              </div> */}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  {/* Simple loading indicator */}
                  <p>Loading...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="events-list">                  {visibleEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  
                  {hasMoreEvents && (
                    <div className="text-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleLoadMore}
                      >
                        Show More ({filteredEvents.length - visibleEventCount} remaining)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <NoEvents />
              )}
            </CardContent>
          </Card>
          
          <Card className="distribution-card">
            <CardHeader>
              <CardTitle>Cards Requiring Distribution</CardTitle>
              <CardDescription>Business cards that need to be distributed soon</CardDescription>
            </CardHeader>
            <CardContent>
              <CardDistributionItem title="Marketing Team Cards" count={12} />
              <CardDistributionItem title="Sales Department Cards" count={8} />
              <CardDistributionItem title="Executive Cards" count={3} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={selectedEvent !== null} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Event details and management
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="event-dialog-content">
              <div className="event-dialog-header">
                <Badge 
                  variant="outline" 
                  style={{ backgroundColor: getEventTypeColor(selectedEvent.type).bg, color: getEventTypeColor(selectedEvent.type).text }}
                >
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </Badge>
                <div className="event-dialog-actions">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="btn-delete"
                    onClick={() => handleDeleteEvent(selectedEvent)}
                  >
                    <MdDelete className="icon-delete" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
              
              {/* Show API error message in dialog if delete fails */}
              {apiError && (
                <div className="error-message mt-2">
                  <MdErrorOutline className="error-icon" size={20} />
                  <div>
                    <div className="error-title">Error</div>
                    <div>{apiError}</div>
                  </div>
                </div>
              )}
              
              <div className="event-dialog-details">
                <div className="event-dialog-detail">
                  <MdAccessTime className="icon" />
                  <div className="event-dialog-detail-content">
                    <span className="event-dialog-detail-label">Date & Time</span>
                    <span className="event-dialog-detail-value">
                      {format(selectedEvent.date, "MMMM d, yyyy")} • {selectedEvent.time}
                    </span>
                  </div>
                </div>
                
                <div className="event-dialog-detail">
                  <MdLocationOn className="icon" />
                  <div className="event-dialog-detail-content">
                    <span className="event-dialog-detail-label">Location</span>
                    <span className="event-dialog-detail-value">{selectedEvent.location}</span>
                  </div>
                </div>
                
                <div className="event-dialog-detail">
                  <MdPeople className="icon" />
                  <div className="event-dialog-detail-content">
                    <span className="event-dialog-detail-label">Attendees</span>
                    <div className="attendees-list">
                      {selectedEvent.attendees.map((attendee: string, index: number) => (
                        <div key={index} className="attendee-item">
                          <div className="attendee-status"></div>
                          <span className="attendee-name">{attendee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog 
        open={isAddEventOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddEventOpen(false);
          }
        }}
      >
        <DialogContent className="event-dialog-content-large">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for the calendar
            </DialogDescription>
          </DialogHeader>
          
          {/* Show success message after submission */}
          {formSubmitted && (
            <div className="success-message">
              <MdCheckCircle className="success-icon" size={20} />
              <div>
                <div className="success-title">Success!</div>
                <div>Your event has been created successfully.</div>
              </div>
            </div>
          )}
          
          {/* Show API error message */}
          {apiError && (
            <div className="error-message">
              <MdErrorOutline className="error-icon" size={20} />
              <div>
                <div className="error-title">Error</div>
                <div>{apiError}</div>
              </div>
            </div>
          )}
          
          <div className="add-event-form">
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <Input 
                name="title"
                value={eventFormData.title}
                onChange={handleFormChange}
                placeholder="Enter event title" 
                required
                className={formErrors.title ? "border-red-500" : ""}
              />
              {formErrors.title && (
                <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <Textarea 
                name="description"
                value={eventFormData.description}
                onChange={handleFormChange}
                placeholder="Enter event description"
                className={`h-24 ${formErrors.description ? "border-red-500" : ""}`}
              />
              {formErrors.description && (
                <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <div className="custom-date-picker-container">
                <Button

                  className={`date-picker-button ${formErrors.date ? "border-red-500" : ""}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDatePickerOpen(prevState => !prevState);
                  }}
                >
                  <MdEvent className="icon-calendar" />
                  <span>{eventFormData.date ? format(eventFormData.date, "PPP") : "Select a date"}</span>
                </Button>
                
                {isDatePickerOpen && (
                  <div 
                    ref={datePickerRef}
                    className="custom-date-picker-popover"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Calendar
                      selectedDate={eventFormData.date}
                      minDate={new Date()}
                      onDateSelect={(newDate) => {
                        setEventFormData(prev => {
                          // Check if the selected date is today
                          const today = new Date();
                          const isToday = 
                            newDate.getDate() === today.getDate() &&
                            newDate.getMonth() === today.getMonth() &&
                            newDate.getFullYear() === today.getFullYear();
                          
                          // Set appropriate start time
                          let startTime = prev.startTime;
                          if (isToday) {
                            startTime = getDefaultTimeForToday();
                          } else if (!startTime) {
                            startTime = "9:00 AM";
                          }
                          
                          return { 
                            ...prev, 
                            date: newDate,
                            startTime 
                          };
                        });
                        setIsDatePickerOpen(false);
                      }}
                      events={eventDates}
                    />
                  </div>
                )}
              </div>
              {formErrors.date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group form-group-half">
                <label className="form-label">Start Time</label>
                <Select 
                  onValueChange={(value) => handleSelectChange("startTime", value)}
                  value={eventFormData.startTime}
                >
                  <SelectTrigger className={formErrors.startTime ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions
                      // Filter out past times if the selected date is today
                      .filter(time => {
                        const today = new Date();
                        const selectedDate = eventFormData.date || new Date();
                        
                        // Only filter if date is today
                        if (selectedDate.getDate() === today.getDate() &&
                            selectedDate.getMonth() === today.getMonth() &&
                            selectedDate.getFullYear() === today.getFullYear()) {
                          return !isTimeInPastForToday(time);
                        }
                        
                        return true;
                      })
                      .map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                {formErrors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>
                )}
              </div>
              <div className="form-group form-group-half">
                <label className="form-label">Duration</label>
                <Select 
                  onValueChange={(value) => handleSelectChange("duration", value)}
                  value={eventFormData.duration}
                >
                  <SelectTrigger className={formErrors.duration ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.duration && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.duration}</p>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location</label>
              <Input 
                name="location"
                value={eventFormData.location}
                onChange={handleFormChange}
                placeholder="Enter location (e.g., Conference Room, Zoom link)" 
                className={formErrors.location ? "border-red-500" : ""}
              />
              {formErrors.location && (
                <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <Select 
                onValueChange={(value) => handleSelectChange("timezone", value)}
                value={eventFormData.timezone}
              >
                <SelectTrigger className={formErrors.timezone ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.timezone && (
                <p className="text-red-500 text-xs mt-1">{formErrors.timezone}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Event Type</label>
              <Select 
                onValueChange={(value) => handleSelectChange("type", value)}
                value={eventFormData.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Add Attendees</label>
              <div className="attendee-input-container">
                <Input 
                  name="attendees"
                  value={eventFormData.attendees}
                  onChange={handleFormChange}
                  placeholder="Name <email@example.com> or just email"
                  className={formErrors.attendees ? "border-red-500" : ""}
                />
                <Button 
                  type="button" 
                  onClick={handleAddAttendee}
                  disabled={!eventFormData.attendees.trim()}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              {formErrors.attendees && (
                <p className="text-red-500 text-xs mt-1">{formErrors.attendees}</p>
              )}
              {attendeeList.length > 0 && (
                <div className="attendee-list-container">
                  <p className="attendee-list-label">Added attendees ({attendeeList.length}):</p>
                  {attendeeList.map((attendee, index) => (
                    <div key={index} className="attendee-chip">
                      <span>{attendee.name}</span>
                      {attendee.email && <span className="attendee-email">({attendee.email})</span>}
                      <button 
                        type="button" 
                        className="attendee-remove" 
                        onClick={() => handleRemoveAttendee(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="form-help-text">
                Add attendees in the format "Name &lt;email@example.com&gt;" or just enter an email address.
              </p>
            </div>
            
            <div className="form-group">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="delete-draft"
                  className="mr-2 h-4 w-4"
                  onChange={() => clearEventDraft()}
                />
                <label htmlFor="delete-draft" className="text-sm text-gray-500">
                  Clear saved draft data
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAddEventOpen(false);
              }}
              className="mr-2"
              type="button"
            >
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmitEvent();
              }}
              disabled={formSubmitting || !eventFormData.title}
              type="button"
            >
              {formSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Add Event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Toast for creation */}
      {createSuccess && (
        <div className="success-toast">
          <MdCheckCircle className="success-icon" size={20} />
          <span>Event created successfully</span>
        </div>
      )}

      {/* Success Toast for deletion */}
      {deleteSuccess && (
        <div className="success-toast delete-toast">
          <MdCheckCircle className="success-icon" size={20} />
          <span>Event deleted successfully</span>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeletingEvent} onOpenChange={cancelDeleteEvent}>
        <DialogContent className="delete-dialog-content">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {apiError && (
            <div className="error-message">
              <MdErrorOutline className="error-icon" size={20} />
              <div>
                <div className="error-title">Error</div>
                <div>{apiError}</div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={cancelDeleteEvent}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="delete-confirm-button"
              onClick={confirmDeleteEvent}
            >
              Delete
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
                <strong>Note:</strong> Calendar permissions are managed by your administrator in the Security Settings.
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
    </div>
  );
};

export default CalendarPage;

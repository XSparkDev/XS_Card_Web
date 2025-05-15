import React from "react";
import { useState, useEffect } from "react";
import { format, parseISO, parse } from "date-fns";
import {
  MdAccessTime,
  MdLocationOn,
  MdPeople,
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdEvent,
  MdCreditCard,
  MdEdit,
  MdDelete,
  MdArrowDropDown,
  MdToday,
  MdSchedule,
  MdDescription,
  MdPublic,
  MdErrorOutline,
  MdCheckCircle
} from "react-icons/md";
import '../../styles/Calendar.css';
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, DEFAULT_USER_ID } from "../../utils/api";

// Import UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../UI/card";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Calendar } from "../UI/calendarWeb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../UI/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../UI/popover";
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

// Sample events data - will be replaced with API data
const sampleEvents = [
  {
    id: 1,
    title: "Marketing Team Card Distribution",
    date: new Date(2023, 4, 15),
    time: "10:00 AM - 11:30 AM",
    location: "Conference Room A",
    type: "distribution",
    attendees: ["John Smith", "Sarah Johnson", "Michael Brown"]
  },
  {
    id: 2,
    title: "New Template Design Review",
    date: new Date(2023, 4, 18),
    time: "2:00 PM - 3:00 PM",
    location: "Virtual Meeting",
    type: "design",
    attendees: ["Emily Davis", "David Wilson"]
  },
  {
    id: 3,
    title: "Quarterly Card Inventory",
    date: new Date(2023, 4, 22),
    time: "9:00 AM - 12:00 PM",
    location: "Storage Room",
    type: "inventory",
    attendees: ["John Smith", "Jessica Martinez"]
  },
  {
    id: 4,
    title: "Client Card Presentation",
    date: new Date(2023, 4, 25),
    time: "1:00 PM - 2:30 PM",
    location: "Client Office",
    type: "presentation",
    attendees: ["Sarah Johnson", "Michael Brown", "David Wilson"]
  }
];

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
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [eventFormData, setEventFormData] = useState(initialEventFormData);
  const [attendeeList, setAttendeeList] = useState<{name: string, email: string}[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const today = new Date();
  const currentMonth = format(date || today, "MMMM yyyy");
  
  const filteredEvents = events.filter(event => {
    if (!date) return false;
    
    return event.date.getDate() === date.getDate() && 
           event.date.getMonth() === date.getMonth() && 
           event.date.getFullYear() === date.getFullYear();
  });
  
  // Extract event dates for the calendar indicators
  const eventDates = events.map(event => new Date(event.date));

  // Function to fetch events from API
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      // Use the userId - using DEFAULT_USER_ID from api.ts as a fallback
      const userId = localStorage.getItem('userId') || DEFAULT_USER_ID;
      
      // Use the enterprise API pattern (like in handleSubmitEvent)
      const url = buildEnterpriseUrl(ENDPOINTS.CREATE_MEETING + `/${userId}`);
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
  
  // Helper function to determine event type based on title or description
  const determineEventType = (titleOrDesc: string): string => {
    if (titleOrDesc.includes('distribution') || titleOrDesc.includes('card')) {
      return 'distribution';
    } else if (titleOrDesc.includes('design') || titleOrDesc.includes('template')) {
      return 'design';
    } else if (titleOrDesc.includes('inventory')) {
      return 'inventory';
    } else if (titleOrDesc.includes('presentation') || titleOrDesc.includes('meeting')) {
      return 'presentation';
    }
    return 'presentation'; // Default type
  };

  // Load events when component mounts or date changes
  useEffect(() => {
    fetchEvents();
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

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddEventOpen) {
      // If there's no saved draft, reset the form
      if (!localStorage.getItem('eventFormDraft')) {
        setEventFormData({
          ...initialEventFormData,
          date: date || new Date()
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
    // Pre-populate the form with distribution info
    setEventFormData({
      ...initialEventFormData,
      date: date || new Date(),
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

  // Update the form validation in handleSubmitEvent
  const handleSubmitEvent = async () => {
    // Reset any previous errors
    setApiError(null);
    
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
    
    try {
      // Use the enterprise API pattern (like in Department.tsx)
      const url = buildEnterpriseUrl(ENDPOINTS.MEETING_INVITE);
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
    
    return (
      <button 
        className="event-card"
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

  // No events placeholder
  const NoEvents = () => (
    <div className="no-events">
      <MdEvent className="no-events-icon" />
      <h3 className="no-events-title">No events scheduled</h3>
      <p className="no-events-description">There are no events scheduled for this day.</p>
      <Button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Reset form data
          setEventFormData({
            ...initialEventFormData,
            date: date || new Date()
          });
          setAttendeeList([]);
          setIsAddEventOpen(true);
        }}
      >
        <MdAdd className="icon-add" />
        <span>Add Event</span>
      </Button>
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
      >
        Schedule
      </Button>
    </div>
  );

  return (
    <div className="calendar-page">
      <div className="calendar-page-header">
        <div className="calendar-title">
          <h1>Calendar</h1>
          <p className="calendar-subtitle">Schedule and manage business card related events.</p>
        </div>
        <Button 
          className="add-event-button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Reset form data when opening
            setEventFormData({
              ...initialEventFormData,
              date: date || new Date()
            });
            setAttendeeList([]);
            setIsAddEventOpen(true);
          }}
        >
          <MdAdd className="icon-add" />
          Add Event
        </Button>
      </div>
      
      <div className="calendar-layout">
        {/* Left sidebar - renamed from "sidebar" to "calendar-sidebar" */}
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
              <EventTypeIndicator color="#3b82f6" label="Distribution" />
              <EventTypeIndicator color="#8b5cf6" label="Design Review" />
              <EventTypeIndicator color="#f59e0b" label="Inventory" />
              <EventTypeIndicator color="#10b981" label="Presentation" />
            </CardContent>
          </Card>
          
          <Card className="upcoming-events-card">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="upcoming-event">
                  <p className="upcoming-event-title">{event.title}</p>
                  <p className="upcoming-event-date">
                    {format(event.date, "MMM d")} • {event.time}
                  </p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="view-all-button">View All</Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Main content - renamed from "main-content" to "calendar-content" */}
        <div className="calendar-content">
          <Card className="events-card">
            <CardHeader className="events-card-header">
              <div>
                <CardTitle>Events for {date ? format(date, "MMMM d, yyyy") : "Today"}</CardTitle>
                <CardDescription>
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} scheduled
                </CardDescription>
              </div>
              <div className="view-toggle">
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
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="loading-events">
                  <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2">Loading events...</p>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="events-list">
                  {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
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
                  <Button variant="outline" size="sm" className="mr-2">
                    <MdEdit className="icon-edit" />
                    <span>Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" className="btn-delete">
                    <MdDelete className="icon-delete" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
              
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
              <Popover>
                <PopoverTrigger>
                  <Button 
                    variant="outline" 
                    className={`date-picker-button ${formErrors.date ? "border-red-500" : ""}`}
                  >
                    <MdEvent className="icon-calendar" />
                    <span>{eventFormData.date ? format(eventFormData.date, "PPP") : "Select a date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    selectedDate={eventFormData.date}
                    onDateSelect={(newDate) => setEventFormData(prev => ({ ...prev, date: newDate }))}
                    events={eventDates}
                  />
                </PopoverContent>
              </Popover>
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
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
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
    </div>
  );
};

export default CalendarPage;

import { useState } from "react";
import { format } from "date-fns";
// For icons, you can use react-icons or another web-friendly icon library
// Example if using react-icons:
// import { MdAccessTime, MdLocationOn, MdPeople, MdAdd, MdChevronLeft, 
//          MdChevronRight, MdEvent, MdCreditCard, MdEdit, MdDelete, 
//          MdArrowDropDown } from "react-icons/md";
import '../../styles/Calendar.css';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../UI/card";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Calendar } from "../UI/calendarWeb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../UI/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../UI/popover";
import { Badge } from "../UI/badge";

// Sample events data
const events = [
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

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  
  const today = new Date();
  const currentMonth = format(date || today, "MMMM yyyy");
  
  const filteredEvents = events.filter(event => {
    if (!date) return false;
    
    return event.date.getDate() === date.getDate() && 
           event.date.getMonth() === date.getMonth() && 
           event.date.getFullYear() === date.getFullYear();
  });

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
    }
  };

  const handlePrevMonth = () => {
    if (date) {
      const prevMonth = new Date(date);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setDate(prevMonth);
    }
  };

  const handleToday = () => {
    setDate(new Date());
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
                {/* Replace with actual icon */}
                <span className="icon">⏱️</span>
                <span className="event-detail-text">{event.time}</span>
              </div>
              <div className="event-detail">
                {/* Replace with actual icon */}
                <span className="icon">📍</span>
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
          {/* Replace with actual icon */}
          <span className="icon">👥</span>
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
      {/* Replace with actual icon */}
      <span className="no-events-icon">📅</span>
      <h3 className="no-events-title">No events scheduled</h3>
      <p className="no-events-description">There are no events scheduled for this day.</p>
      <Button onClick={() => setIsAddEventOpen(true)}>
        {/* Replace with actual icon */}
        <span className="icon-add">➕</span>
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
        {/* Replace with actual icon */}
        <span className="icon-card">💳</span>
        <div>
          <p className="distribution-title">{title}</p>
          <p className="distribution-count">{count} cards pending distribution</p>
        </div>
      </div>
      <Button variant="outline" size="sm">Schedule</Button>
    </div>
  );

  return (
    <div className="calendar-page">
      <div className="calendar-page-header">
        <div className="calendar-title">
          <h1>Calendar</h1>
          <p className="calendar-subtitle">Schedule and manage business card related events.</p>
        </div>
        <button className="add-event-button" onClick={() => setIsAddEventOpen(true)}>
          <span className="icon-add">+</span>
          Add Event
        </button>
      </div>
      
      <div className="calendar-layout">
        {/* Left sidebar - renamed from "sidebar" to "calendar-sidebar" */}
        <div className="calendar-sidebar">
          <Card>
            <CardContent className="calendar-widget">
              <div className="calendar-header">
                <button className="icon-button" onClick={handlePrevMonth}>
                  {/* Replace with actual icon */}
                  <span>◀</span>
                </button>
                <span className="current-month">{currentMonth}</span>
                <button className="icon-button" onClick={handleNextMonth}>
                  {/* Replace with actual icon */}
                  <span>▶</span>
                </button>
              </div>
              
              <Calendar
                selectedDate={date}
                onDateSelect={setDate}
              />
              
              <button className="today-button" onClick={handleToday}>
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
                  className={`view-toggle-button ${view === "month" ? "view-toggle-button-active" : ""}`}
                  onClick={() => setView("month")}
                >
                  <span className={`view-toggle-text ${view === "month" ? "view-toggle-text-active" : ""}`}>Month</span>
                </button>
                <button 
                  className={`view-toggle-button ${view === "week" ? "view-toggle-button-active" : ""}`}
                  onClick={() => setView("week")}
                >
                  <span className={`view-toggle-text ${view === "week" ? "view-toggle-text-active" : ""}`}>Week</span>
                </button>
                <button 
                  className={`view-toggle-button ${view === "day" ? "view-toggle-button-active" : ""}`}
                  onClick={() => setView("day")}
                >
                  <span className={`view-toggle-text ${view === "day" ? "view-toggle-text-active" : ""}`}>Day</span>
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredEvents.length > 0 ? (
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
                    {/* Replace with actual icon */}
                    <span className="icon-edit">✏️</span>
                    <span>Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" className="btn-delete">
                    {/* Replace with actual icon */}
                    <span className="icon-delete">🗑️</span>
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
              
              <div className="event-dialog-details">
                <div className="event-dialog-detail">
                  {/* Replace with actual icon */}
                  <span className="icon">⏱️</span>
                  <div className="event-dialog-detail-content">
                    <span className="event-dialog-detail-label">Date & Time</span>
                    <span className="event-dialog-detail-value">
                      {format(selectedEvent.date, "MMMM d, yyyy")} • {selectedEvent.time}
                    </span>
                  </div>
                </div>
                
                <div className="event-dialog-detail">
                  {/* Replace with actual icon */}
                  <span className="icon">📍</span>
                  <div className="event-dialog-detail-content">
                    <span className="event-dialog-detail-label">Location</span>
                    <span className="event-dialog-detail-value">{selectedEvent.location}</span>
                  </div>
                </div>
                
                <div className="event-dialog-detail">
                  {/* Replace with actual icon */}
                  <span className="icon">👥</span>
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
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for the calendar
            </DialogDescription>
          </DialogHeader>
          <div className="add-event-form">
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <Input placeholder="Enter event title" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <Popover>
                <PopoverTrigger>
                  <Button variant="outline" className="date-picker-button">
                    {/* Replace with actual icon */}
                    <span className="icon-calendar">📅</span>
                    <span>{date ? format(date, "PPP") : "Select a date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    selectedDate={date}
                    onDateSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="form-row">
              <div className="form-group form-group-half">
                <label className="form-label">Start Time</label>
                <div className="select">
                  <span>9:00 AM</span>
                  {/* Replace with actual icon */}
                  <span className="icon-dropdown">▼</span>
                </div>
              </div>
              <div className="form-group form-group-half">
                <label className="form-label">End Time</label>
                <div className="select">
                  <span>10:00 AM</span>
                  {/* Replace with actual icon */}
                  <span className="icon-dropdown">▼</span>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location</label>
              <Input placeholder="Enter location" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Event Type</label>
              <div className="select">
                <span>Distribution</span>
                {/* Replace with actual icon */}
                <span className="icon-dropdown">▼</span>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Attendees</label>
              <Input placeholder="Add attendees (comma separated)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={() => setIsAddEventOpen(false)}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;

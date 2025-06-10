import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import "../../styles/Analytics.css";
import "../../styles/Dashboard.css";
import "../../styles/MetricCards.css";
import { 
  FaUsers, 
  FaIdCard, 
  FaLeaf, 
  FaChartLine, 
  FaCommentDots, 
  FaPalette,
  FaTree,
  FaTint,
  FaCloud,
  FaArrowUp,
  FaCalendarAlt,
  FaEye
} from "react-icons/fa";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, buildUrl, DEFAULT_USER_ID } from "../../utils/api";
import { 
  calculatePaperSaved, 
  calculateWaterSaved, 
  calculateCO2Saved,
  calculateTreesSaved,
  calculateMonthOverMonthGrowth,
  sortMonthsChronologically
} from "../../utils/environmentalImpact";
import EmployeeHeatmap from "./EmployeeHeatmap";

// User ID specifically for contacts - using the same ID as heatmap
// const CONTACTS_USER_ID = "EcccyMCv7uiS1eYHB3ZMu6zRR1DG2"; // Removed hardcoded ID

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

// Define API response interfaces
interface ContactsSummaryResponse {
  success: boolean;
  data: {
    totalContacts: number;
    totalDepartments: number;
  };
}

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

// Interface for meeting attendees
interface MeetingAttendee {
  email: string;
  name: string;
}

// Interface for meeting data
interface Meeting {
  title?: string;
  meetingWith: string;
  meetingWhen: string;
  endTime?: { _seconds: number; _nanoseconds: number };
  description?: string;
  location?: string;
  attendees?: MeetingAttendee[]; // Made optional since some meetings don't have this field
  duration: number;
}

// Growth chart data point interface
interface GrowthDataPoint {
  date: string;
  totalContacts: number;
}

const Analytics = () => {
  const [activeCardsCount, setActiveCardsCount] = useState<number>(0);
  const [connectionsCount, setConnectionsCount] = useState<number>(0);
  const [totalScansCount, setTotalScansCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionsLoading, setConnectionsLoading] = useState<boolean>(true);
  const [scansLoading, setScansLoading] = useState<boolean>(true);
  
  // Contact growth states
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState<number>(0);
  const [growthLoading, setGrowthLoading] = useState<boolean>(true);
  
  // Meetings states
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState<boolean>(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  // Add a new state for tracking expanded state of meetings overview
  const [meetingsExpanded, setMeetingsExpanded] = useState<boolean>(false);

  // Add a new state for tracking expanded state of connection growth chart
  const [growthExpanded, setGrowthExpanded] = useState<boolean>(false);

  // Fetch cards count
  useEffect(() => {
    const fetchCardsCount = async () => {
      try {
        setLoading(true);
        
        // Use the same API utility functions as in BusinessCards component
        const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CARDS);
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the response
        const responseData = await response.json();
        
        // Extract cards data from the response
        let cardsData = [];
        
        if (Array.isArray(responseData)) {
          cardsData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (Array.isArray(responseData.data)) {
            cardsData = responseData.data;
          } else if (Array.isArray(responseData.cards)) {
            cardsData = responseData.cards;
          } else {
            cardsData = [responseData];
          }
        }
        
        // Set the count of active cards
        setActiveCardsCount(cardsData.length);
      } catch (err) {
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };
      fetchCardsCount();
  }, []);

  // Fetch total scans count
  useEffect(() => {
    const fetchTotalScans = async () => {
      try {
        setScansLoading(true);
        
        // Use the same API utility functions as in BusinessCards component
        const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CARDS);
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the response
        const responseData = await response.json();
        
        // Extract cards data from the response
        let cardsData = [];
        
        if (Array.isArray(responseData)) {
          cardsData = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (Array.isArray(responseData.data)) {
            cardsData = responseData.data;
          } else if (Array.isArray(responseData.cards)) {
            cardsData = responseData.cards;
          } else {
            cardsData = [responseData];
          }
        }
          // Calculate total scans across all cards
        const totalScans = cardsData.reduce((sum: number, card: any) => {
          return sum + (card.scans || 0);
        }, 0);
        
        setTotalScansCount(totalScans);
      } catch (err) {
        console.error("Error fetching scans data:", err);
      } finally {
        setScansLoading(false);
      }
    };
    
    fetchTotalScans();
  }, []);
  // Fetch connections count AND growth data using enterprise endpoints
  useEffect(() => {
    const fetchConnectionsData = async () => {
      try {
        setConnectionsLoading(true);
        setGrowthLoading(true);
        
        // Use enterprise contacts summary endpoint first to get total count
        const summaryUrl = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CONTACTS_SUMMARY);
        const summaryResponse = await fetch(summaryUrl, {
          headers: getEnterpriseHeaders(),
        });
        
        if (summaryResponse.ok) {
          const summaryData: ContactsSummaryResponse = await summaryResponse.json();
          setConnectionsCount(summaryData.data.totalContacts);
        }
        
        // Fetch detailed contacts for growth data
        const detailsUrl = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CONTACTS);
        const detailsResponse = await fetch(detailsUrl, {
          headers: getEnterpriseHeaders(),
        });
        
        if (detailsResponse.ok) {
          const detailsData: EnterpriseContactsResponse = await detailsResponse.json();
          
          // Flatten contacts from all departments for growth processing
          const allContacts: Contact[] = [];
          Object.values(detailsData.data.contactsByDepartment).forEach(dept => {
            allContacts.push(...dept.contacts);
          });
          
          // Process growth data
          processGrowthData(allContacts);
        } else {
          throw new Error(`Failed to fetch contact details: ${detailsResponse.status}`);
        }
        
      } catch (err) {
        console.error("Error fetching connections:", err);
        // Set empty data on error
        setConnectionsCount(0);
        setGrowthData([]);
        setGrowthPercentage(0);
      } finally {
        setConnectionsLoading(false);
        setGrowthLoading(false);
      }
    };
    
    fetchConnectionsData();
  }, []);
    // Fetch meetings data
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setMeetingsLoading(true);
        setMeetingsError(null);
        
        const url = buildUrl(ENDPOINTS.CREATE_MEETING + `/${DEFAULT_USER_ID}`);
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Fix: Extract meetings from the nested response structure
        if (responseData.success && responseData.data && responseData.data.meetings) {
          setMeetings(responseData.data.meetings);
          console.log("Meetings data loaded:", responseData.data.meetings.length, "meetings");
        } else {
          console.warn("Meetings data format unexpected:", responseData);
          setMeetings([]);
          setMeetingsError('No meetings data found');
        }
      } catch (err) {
        setMeetingsError("Failed to fetch meetings data.");
        console.error("Error fetching meetings:", err);
        setMeetings([]); // Set empty array on error
      } finally {
        setMeetingsLoading(false);
      }
    };
    
    fetchMeetings();
  }, []);    // Helper to extract date from contact
  const getDateFromContact = (contact: Contact): Date | null => {
    try {
      const createdAt = contact.createdAt;
      
      if (!createdAt) return null;
      
      // Handle Firebase timestamp format
      if (typeof createdAt === 'object' && '_seconds' in createdAt) {
        const timestamp = createdAt._seconds * 1000;
        const date = new Date(timestamp);
        
        // Validate the date is reasonable (not before 2020 or in the far future)
        if (date.getFullYear() < 2020 || date.getFullYear() > new Date().getFullYear() + 1) {
          console.warn("Invalid date detected:", date, "from timestamp:", timestamp);
          return null;
        }
        
        return date;
      }
      
      // Handle string dates (fallback)
      if (typeof createdAt === 'string') {
        const date = new Date(createdAt);
        return isNaN(date.getTime()) ? null : date;
      }
      
      return null;
    } catch (e) {
      console.warn("Failed to parse date for contact:", contact.name || 'unknown', e);
      return null;
    }
  };
    // Process contact data for growth chart
  const processGrowthData = (contacts: Contact[]) => {
    if (!contacts || contacts.length === 0) {
      // Set empty data and zero growth instead of generating fake data
      setGrowthData([]);
      setGrowthPercentage(0);
      return;
    }
    
    try {
      console.log("Processing", contacts.length, "contacts for growth data");
      
      // Sort contacts by creation date
      const sortedContacts = [...contacts].sort((a, b) => {
        // Try to parse dates
        const dateA = getDateFromContact(a);
        const dateB = getDateFromContact(b);
        
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      });
      
      // Group by month for both running totals and new contact counts
      const monthlyRunningTotals: Record<string, number> = {};
      const monthlyNewContacts: Record<string, number> = {};
      let total = 0;
      
      sortedContacts.forEach(contact => {
        const date = getDateFromContact(contact);
        if (!date) return;
        
        // Format month
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        // Count new contacts for this month
        if (!monthlyNewContacts[monthYear]) {
          monthlyNewContacts[monthYear] = 0;
        }
        monthlyNewContacts[monthYear]++;
        
        // Increment total for running total
        total++;
        
        // Store running total
        monthlyRunningTotals[monthYear] = total;
      });
      
      // Debug output
      console.log("New contacts by month:", monthlyNewContacts);
      console.log("Running totals:", monthlyRunningTotals);
        // Sort months chronologically
      const sortedMonths = Object.keys(monthlyRunningTotals).sort(sortMonthsChronologically);
      
      // Convert to array for chart using running totals
      const chartData = sortedMonths.map(month => ({
        date: month,
        totalContacts: monthlyRunningTotals[month]
      }));
      
      // Take last 6 months
      const recentData = chartData.slice(-6);
      
      console.log("Recent data for growth calculation:", recentData);
      setGrowthData(recentData);
      
      // Calculate month-over-month growth based on new contacts added
      if (recentData.length >= 2) {
        const lastMonth = recentData[recentData.length - 1].date;
        const previousMonth = recentData[recentData.length - 2].date;
        
        const newContactsLastMonth = monthlyNewContacts[lastMonth] || 0;
        const newContactsPreviousMonth = monthlyNewContacts[previousMonth] || 0;
        
        // Log values for debugging
        console.log(`Growth calculation: (${newContactsLastMonth} - ${newContactsPreviousMonth}) / ${newContactsPreviousMonth} * 100`);
        
        // Use utility function for consistent growth calculation
        const growth = calculateMonthOverMonthGrowth(newContactsLastMonth, newContactsPreviousMonth);
        
        console.log("Growth percentage:", growth);
        setGrowthPercentage(growth);
      } else {
        console.log("Not enough months to calculate growth");
        setGrowthPercentage(0);
      }
    } catch (err) {
      console.error("Error processing growth data:", err);
      // Set empty data and zero growth
      setGrowthData([]);
      setGrowthPercentage(0);
    }
  };
  
  // Parse and format meeting time from the unusual format
  const formatMeetingTime = (timeString: string): string => {
    try {
      // Parse the date manually from format like "December 20 2023 at at 2:00:00 PM GMT+2"
      const parts = timeString.replace('at at', 'at').split(' at ');
      if (parts.length < 2) return timeString;
      
      const datePart = parts[0]; // "December 20 2023"
      const timePart = parts[1]; // "2:00:00 PM GMT+2"
      
      // Extract time components
      const timeWithoutTZ = timePart.split(' GMT')[0]; // "2:00:00 PM"
      const [time, period] = timeWithoutTZ.split(' '); // ["2:00:00", "PM"]
      const [hours, minutes] = time.split(':').map(Number); // [2, 0]
      
      // Convert to 24 hour format if PM
      const adjustedHours = period === 'PM' && hours < 12 ? hours + 12 : hours;
      
      // Create date object
      const date = new Date(datePart);
      if (isNaN(date.getTime())) return timeString;
      
      // Set the time components
      date.setHours(adjustedHours);
      date.setMinutes(minutes);
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.warn("Failed to parse meeting time:", e);
      return timeString;
    }
  };
  
  // Parse meeting date for sorting and filtering
  const parseMeetingDate = (timeString: string): Date | null => {
    try {
      // Parse the date manually from format like "December 20 2023 at at 2:00:00 PM GMT+2"
      const parts = timeString.replace('at at', 'at').split(' at ');
      if (parts.length < 2) return null;
      
      const datePart = parts[0]; // "December 20 2023"
      const timePart = parts[1]; // "2:00:00 PM GMT+2"
      
      // Extract time components for more accurate sorting
      const timeWithoutTZ = timePart.split(' GMT')[0]; // "2:00:00 PM"
      const [time, period] = timeWithoutTZ.split(' '); // ["2:00:00", "PM"]
      const [hours, minutes] = time.split(':').map(Number); // [2, 0]
      
      // Convert to 24 hour format if PM
      const adjustedHours = period === 'PM' && hours < 12 ? hours + 12 : hours;
      
      // Create a date object from parts
      const date = new Date(datePart);
      if (isNaN(date.getTime())) return null;
      
      // Set the time components
      date.setHours(adjustedHours);
      date.setMinutes(minutes);
      
      console.log(`Parsed "${timeString}" -> ${date.toISOString()}`);
      
      return date;
    } catch (e) {
      console.warn("Failed to parse meeting date for sorting:", e);
      return null;
    }
  };
  
  // Calculate meeting end time
  const getMeetingEndTime = (meeting: Meeting): Date | null => {
    const startTime = parseMeetingDate(meeting.meetingWhen);
    if (!startTime) return null;
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + (meeting.duration || 30));
    return endTime;
  };
  
  // Check if a meeting is currently active
  const isMeetingActive = (meeting: Meeting): boolean => {
    const now = new Date();
    const startTime = parseMeetingDate(meeting.meetingWhen);
    if (!startTime) return false;
    
    const endTime = getMeetingEndTime(meeting);
    if (!endTime) return false;
    
    return now >= startTime && now < endTime;
  };
  
  // Check if a meeting is in the future
  const isMeetingUpcoming = (meeting: Meeting): boolean => {
    const now = new Date();
    const startTime = parseMeetingDate(meeting.meetingWhen);
    if (!startTime) return false;
    
    return startTime > now;
  };
  
  // Process meetings for display - recalculated periodically
  const processMeetingsForDisplay = () => {
    // Get active meetings
    const active = meetings.filter(meeting => isMeetingActive(meeting))
      .sort((a, b) => {
        const endTimeA = getMeetingEndTime(a);
        const endTimeB = getMeetingEndTime(b);
        return (endTimeA?.getTime() || 0) - (endTimeB?.getTime() || 0); 
      });
    
    // Get upcoming meetings
    const upcoming = meetings.filter(meeting => isMeetingUpcoming(meeting))
      .sort((a, b) => {
        const startTimeA = parseMeetingDate(a.meetingWhen);
        const startTimeB = parseMeetingDate(b.meetingWhen);
        return (startTimeA?.getTime() || 0) - (startTimeB?.getTime() || 0);
      });
    
    return { active, upcoming };
  };
  
  // State for processed meetings
  const [currentMeetings, setCurrentMeetings] = useState<{ active: Meeting[], upcoming: Meeting[] }>({ active: [], upcoming: [] });
  
  // Check if a meeting overlaps with another
  const checkMeetingOverlap = (meeting: Meeting, otherMeeting: Meeting): boolean => {
    const meetingStart = parseMeetingDate(meeting.meetingWhen);
    const otherStart = parseMeetingDate(otherMeeting.meetingWhen);
    
    if (!meetingStart || !otherStart) return false;
    
    const meetingEnd = getMeetingEndTime(meeting);
    const otherEnd = getMeetingEndTime(otherMeeting);
    
    if (!meetingEnd || !otherEnd) return false;
    
    // Check for overlap
    return (meetingStart < otherEnd && meetingEnd > otherStart);
  };
    // Find overlapping meetings
  const findOverlappingMeetings = (meetings: Meeting[]): Record<string, number> => {
    const overlaps: Record<string, number> = {};
    
    meetings.forEach((meeting) => {
      // Use meeting title as a key, fallback to meetingWith if title is undefined
      const key = meeting.title || meeting.meetingWith || 'Untitled Meeting';
      overlaps[key] = 0;
      
      meetings.forEach((otherMeeting) => {
        if (meeting !== otherMeeting && checkMeetingOverlap(meeting, otherMeeting)) {
          overlaps[key]++;
        }
      });
    });
    
    return overlaps;
  };
  
  // Update meeting processing on an interval and when meetings change
  useEffect(() => {
    // Initial processing
    const updateMeetingStatus = () => {
      const processed = processMeetingsForDisplay();
      setCurrentMeetings(processed);
    };
    
    updateMeetingStatus();
    
    // Set up interval to update every minute
    const intervalId = setInterval(updateMeetingStatus, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [meetings]);
  
  // Get meeting conflicts
  const meetingOverlaps = findOverlappingMeetings([...currentMeetings.active, ...currentMeetings.upcoming]);
  // Calculate environmental impact metrics
  const paperSavedKg = calculatePaperSaved(totalScansCount);
  const waterSavedLitres = calculateWaterSaved(paperSavedKg);
  const co2SavedKg = calculateCO2Saved(paperSavedKg);
  const treesSaved = calculateTreesSaved(paperSavedKg);

  // Add a function to toggle the expanded state
  const toggleMeetingsExpand = () => {
    setMeetingsExpanded(!meetingsExpanded);
  };

  // Add a function to toggle the expanded state for growth chart
  const toggleGrowthExpand = () => {
    setGrowthExpanded(!growthExpanded);
  };
  // Calculate filtered meeting stats for display
  const calculateFilteredMeetingStats = () => {
    // Add safety check for meetings array
    if (!meetings || !Array.isArray(meetings)) {
      return {
        meetingsCount: 0,
        participantsCount: 0
      };
    }

    // Only include active and upcoming meetings
    const filteredMeetings = meetings.filter(meeting => 
      isMeetingActive(meeting) || isMeetingUpcoming(meeting)
    );
    
    // Count the total number of filtered meetings
    const activeAndUpcomingCount = filteredMeetings.length;
    
    // Count total participants in filtered meetings - Fixed with proper null checks
    const totalParticipants = filteredMeetings.reduce(
      (sum, meeting) => {
        // Handle missing attendees field entirely
        if (!meeting.attendees) {
          return sum;
        }
        // Handle attendees being null or not an array
        if (!Array.isArray(meeting.attendees)) {
          return sum;
        }
        return sum + meeting.attendees.length;
      },
      0
    );
    
    return {
      meetingsCount: activeAndUpcomingCount,
      participantsCount: totalParticipants
    };
  };

  // Get filtered stats for display
  const filteredStats = calculateFilteredMeetingStats();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-description">Monitor your business card engagement and environmental impact</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">        <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Total Contacts</div>
              <div className="metric-icon-container blue">
                <FaUsers />
              </div>
            </div>
            <div className="metric-value">{connectionsLoading ? "Loading..." : connectionsCount}</div>
            <div className="metric-change positive">
              <span className="arrow">↑</span> 12.5% increase
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Active Cards</div>
              <div className="metric-icon-container purple">
                <FaIdCard />
              </div>
            </div>
            <div className="metric-value">{loading ? "Loading..." : activeCardsCount}</div>
            <div className="metric-change positive">
              <span className="arrow">↑</span> 8.3% increase
            </div>
          </CardContent>        </Card>          <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Contact Growth</div>
              <div className="metric-icon-container green">
                <FaArrowUp />
              </div>
            </div>
            <div className="metric-value">
              {growthLoading ? "Loading..." : `${Math.abs(growthPercentage)}%`}
            </div>
            <div className={`metric-change ${growthPercentage >= 0 ? 'positive' : 'negative'}`}>
              <span className="arrow">{growthPercentage >= 0 ? '↑' : '↓'}</span> 
              {growthPercentage >= 0 ? 'increase' : 'decrease'} from previous period
            </div>
          </CardContent>
        </Card>
          <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Total Scans</div>
              <div className="metric-icon-container orange">
                <FaEye />
              </div>
            </div>
            <div className="metric-value">{scansLoading ? "Loading..." : totalScansCount.toLocaleString()}</div>
            <div className="metric-change positive">
              <span className="arrow">↑</span> Card views this month
            </div>
          </CardContent>
        </Card>
          <Card className="metric-card">
          <CardContent className="metric-card-content">
            <div className="metric-header">
              <div className="metric-label">Average Scans</div>
              <div className="metric-icon-container green">
                <FaChartLine />
              </div>
            </div>
            <div className="metric-value">
              {(scansLoading || loading) ? "Loading..." : 
                activeCardsCount > 0 ? 
                  (totalScansCount / activeCardsCount).toFixed(1) : 
                  "0.0"
              }
            </div>
            <div className="metric-change positive">
              <span className="arrow">↑</span> 
              Scans per business card
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="analytics-grid">
        {/* Heat Map */}
        <Card className="heatmap-card">
          <CardHeader>
            <CardTitle>Employee Networking Heat-map</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeHeatmap />
          </CardContent>
        </Card>

        {/* Engagement Analytics Section */}
        <div className="engagement-section">
          <div className="section-header">
            <h2 className="section-title">Engagement Analytics</h2>
          </div>
          
          <div className="charts-grid">
            <Card className={`chart-card ${meetingsExpanded ? 'meetings-expanded' : ''}`}>
              <CardHeader onClick={toggleMeetingsExpand} className="meetings-card-header">
                <CardTitle className="chart-title">
                  <FaCalendarAlt className="chart-icon" /> Meetings Overview
                </CardTitle>
                <div className="expand-icon">
                  {meetingsExpanded ? '−' : '+'}
                </div>
              </CardHeader>
              <CardContent className={`meetings-content-wrapper ${meetingsExpanded ? 'meetings-content-expanded' : ''}`}>
                <div className="chart-container meetings-chart">
                  {meetingsLoading ? (
                    <div className="loading-indicator">Loading meetings data...</div>
                  ) : meetingsError ? (
                    <div className="error-message">{meetingsError}</div>
                  ) : (currentMeetings.active.length > 0 || currentMeetings.upcoming.length > 0) ? (
                    <div className="meetings-content">
                      <div className="meetings-stats">
                        <div className="meeting-stat">
                          <span className="meeting-stat-value">{meetingsLoading ? "..." : filteredStats.meetingsCount}</span>
                          <span className="meeting-stat-label">Upcoming Meetings</span>
                        </div>
                        <div className="meeting-stat">
                          <span className="meeting-stat-value">{meetingsLoading ? "..." : filteredStats.participantsCount}</span>
                          <span className="meeting-stat-label">Expected Participants</span>
                        </div>
                      </div>
                      
                      {currentMeetings.active.length > 0 ? (                        <div className="next-meeting active-meeting">
                          <h4>Happening Now</h4>
                          <div className={`meeting-card ${meetingOverlaps[currentMeetings.active[0].title || currentMeetings.active[0].meetingWith || 'Untitled Meeting'] > 0 ? 'meeting-overlap' : ''}`}>
                            <div className="meeting-title">{currentMeetings.active[0].title}</div>
                            <div className="meeting-time">
                              {formatMeetingTime(currentMeetings.active[0].meetingWhen)}
                            </div>
                            <div className="meeting-location">{currentMeetings.active[0].location}</div>                            <div className="meeting-attendees">
                              {currentMeetings.active[0].attendees?.length || 0} attendees
                            </div>
                            {meetingsExpanded && (
                              <div className="meeting-details">
                                <div className="meeting-description">
                                  {currentMeetings.active[0].description || "No description available"}
                                </div>
                                {currentMeetings.active[0].attendees && currentMeetings.active[0].attendees.length > 0 && (
                                  <div className="meeting-attendees-list">
                                    <h5>Attendees:</h5>
                                    <ul>
                                      {currentMeetings.active[0].attendees.map((attendee, i) => (
                                        <li key={i}>{attendee.name} ({attendee.email})</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}                            {meetingOverlaps[currentMeetings.active[0].title || currentMeetings.active[0].meetingWith || 'Untitled Meeting'] > 0 && (
                              <div className="meeting-overlap-warning">
                                Conflicts with {meetingOverlaps[currentMeetings.active[0].title || currentMeetings.active[0].meetingWith || 'Untitled Meeting']} other meeting(s)
                              </div>
                            )}
                          </div>
                        </div>
                      ) : currentMeetings.upcoming.length > 0 ? (
                        <div className="next-meeting">
                          <h4>Next Meeting</h4>                          <div className={`meeting-card ${meetingOverlaps[currentMeetings.upcoming[0].title || currentMeetings.upcoming[0].meetingWith || 'Untitled Meeting'] > 0 ? 'meeting-overlap' : ''}`}>
                            <div className="meeting-title">{currentMeetings.upcoming[0].title}</div>
                            <div className="meeting-time">
                              {formatMeetingTime(currentMeetings.upcoming[0].meetingWhen)}
                            </div>
                            <div className="meeting-location">{currentMeetings.upcoming[0].location}</div>                            <div className="meeting-attendees">
                              {currentMeetings.upcoming[0].attendees?.length || 0} attendees
                            </div>
                            {meetingsExpanded && (
                              <div className="meeting-details">
                                <div className="meeting-description">
                                  {currentMeetings.upcoming[0].description || "No description available"}
                                </div>
                                {currentMeetings.upcoming[0].attendees && currentMeetings.upcoming[0].attendees.length > 0 && (
                                  <div className="meeting-attendees-list">
                                    <h5>Attendees:</h5>
                                    <ul>
                                      {currentMeetings.upcoming[0].attendees.map((attendee, i) => (
                                        <li key={i}>{attendee.name} ({attendee.email})</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}                            {meetingOverlaps[currentMeetings.upcoming[0].title || currentMeetings.upcoming[0].meetingWith || 'Untitled Meeting'] > 0 && (
                              <div className="meeting-overlap-warning">
                                Conflicts with {meetingOverlaps[currentMeetings.upcoming[0].title || currentMeetings.upcoming[0].meetingWith || 'Untitled Meeting']} other meeting(s)
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                      
                      {currentMeetings.upcoming.length > 0 && (
                        <div className="upcoming-meetings">
                          <h4>Upcoming Meetings</h4>
                          <div className="meetings-list">                            {currentMeetings.upcoming.slice(currentMeetings.active.length > 0 ? 0 : 1, meetingsExpanded ? currentMeetings.upcoming.length : 3).map((meeting, index) => (
                              <div className={`meeting-list-item ${meetingOverlaps[meeting.title || meeting.meetingWith || 'Untitled Meeting'] > 0 ? 'meeting-overlap' : ''}`} key={index}>
                                <div className="meeting-list-title">{meeting.title}</div>
                                <div className="meeting-list-time">
                                  {formatMeetingTime(meeting.meetingWhen)}
                                </div>
                                {meetingsExpanded && (
                                  <div className="meeting-expanded-details">
                                    <div className="meeting-location">{meeting.location}</div>
                                    <div className="meeting-description-preview">
                                      {meeting.description ? meeting.description.substring(0, 50) + (meeting.description.length > 50 ? '...' : '') : 'No description'}
                                    </div>
                                  </div>
                                )}                                {meetingOverlaps[meeting.title || meeting.meetingWith || 'Untitled Meeting'] > 0 && (
                                  <div className="meeting-overlap-warning">
                                    Conflicts with {meetingOverlaps[meeting.title || meeting.meetingWith || 'Untitled Meeting']} other meeting(s)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-data-message">No upcoming meetings</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={`chart-card ${growthExpanded ? 'growth-expanded' : ''}`}>
              <CardHeader onClick={toggleGrowthExpand} className="growth-card-header">
                <CardTitle className="chart-title">
                  <FaChartLine className="chart-icon" /> Connection Growth Over Time
                </CardTitle>
                <div className="expand-icon">
                  {growthExpanded ? '−' : '+'}
                </div>
              </CardHeader>
              <CardContent className={`growth-content-wrapper ${growthExpanded ? 'growth-content-expanded' : ''}`}>
                <div className="chart-container line-chart">
                  {growthLoading ? (
                    <div className="loading-indicator">Loading chart data...</div>
                  ) : growthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={growthData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          width={30}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '12px'
                          }}
                          itemStyle={{ color: '#38bdf8' }}
                          labelStyle={{ color: 'white', fontWeight: 'bold' }}
                          formatter={(value) => [`${value} connections`, 'Total']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="totalContacts" 
                          stroke="#38bdf8" 
                          strokeWidth={2}
                          dot={{ fill: '#38bdf8', r: 4 }}
                          activeDot={{ fill: '#0ea5e9', r: 6, stroke: '#0c4a6e', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="no-data-message">No connection data available</div>
                  )}
                </div>
                {growthExpanded && growthData.length > 0 && (
                  <div className="growth-details">
                    <h4>Monthly Growth Details</h4>
                    <table className="growth-table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Total Connections</th>
                          <th>New Connections</th>
                        </tr>
                      </thead>
                      <tbody>
                        {growthData.map((item, index) => {
                          const prevConnections = index > 0 ? growthData[index - 1].totalContacts : 0;
                          const newConnections = item.totalContacts - prevConnections;
                          return (
                            <tr key={index}>
                              <td>{item.date}</td>
                              <td>{item.totalContacts}</td>
                              <td className={newConnections > 0 ? 'positive' : ''}>
                                {index > 0 ? `+${newConnections}` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="chart-card">
              <CardHeader>
                <CardTitle className="chart-title">
                  <FaCommentDots className="chart-icon" /> Mention Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container donut-chart">
                  {/* Placeholder for donut chart */}
                </div>
              </CardContent>
            </Card>

            <Card className="chart-card">
              <CardHeader>
                <CardTitle className="chart-title">
                  <FaPalette className="chart-icon" /> Design Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container area-chart">
                  {/* Placeholder for area chart */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="bottom-grid">
        {/* CRM Integration */}
        <Card className="crm-card">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>CRM Integration</CardTitle>
            <button className="export-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export</span>
            </button>
          </CardHeader>
          <CardContent>
            <div className="crm-integration">
              <div className="crm-item">
                <div className="crm-logo salesforce">
                  <span>SF</span>
                </div>
                <div className="crm-info">
                  <span className="crm-name">Salesforce</span>
                </div>
                <div className="crm-status">
                  <span className="status-badge connected">Connected</span>
                </div>
              </div>
              
              <div className="crm-item">
                <div className="crm-logo hubspot" style={{ backgroundColor: "#ff7a59", color: "white" }}>
                  <span>H</span>
                </div>
                <div className="crm-info">
                  <span className="crm-name">HubSpot</span>
                </div>
                <div className="crm-status">
                  <span className="status-badge connected">Connected</span>
                </div>
              </div>
              
              <div className="crm-item">
                <div className="crm-logo microsoft" style={{ backgroundColor: "#0078d4", color: "white" }}>
                  <span>MD</span>
                </div>
                <div className="crm-info">
                  <span className="crm-name">Microsoft Dynamics</span>
                </div>
                <div className="crm-status">
                  <button className="connect-button">Connect</button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card className="environmental-card">
          <CardHeader>
            <CardTitle>Environmental Impact</CardTitle>
          </CardHeader>          <CardContent>
            <div className="environmental-impact-grid">              <div className="impact-box trees-box">
                <div className="impact-content">
                  <div className="impact-title">Trees Saved</div>
                  <div className="impact-value trees-value">
                    {scansLoading ? "Loading..." : treesSaved}
                  </div>
                </div>
                <div className="impact-icon-container">
                  <FaTree className="impact-icon" />
                </div>
              </div>
              
              <div className="impact-box water-box">
                <div className="impact-content">
                  <div className="impact-title">Water Saved</div>
                  <div className="impact-value water-value">
                    {scansLoading ? "Loading..." : `${waterSavedLitres}L`}
                  </div>
                </div>
                <div className="impact-icon-container">
                  <FaTint className="impact-icon" />
                </div>
              </div>
              
              <div className="impact-box co2-box">
                <div className="impact-content">
                  <div className="impact-title">CO<sub>2</sub> Reduced</div>
                  <div className="impact-value co2-value">
                    {scansLoading ? "Loading..." : `${co2SavedKg} kg`}
                  </div>
                </div>
                <div className="impact-icon-container">
                  <FaCloud className="impact-icon" />
                </div>
              </div>
              
              <div className="impact-box paper-box">
                <div className="impact-content">
                  <div className="impact-title">Paper Saved</div>
                  <div className="impact-value paper-value">
                    {scansLoading ? "Loading..." : `${paperSavedKg} kg`}
                  </div>
                </div>
                <div className="impact-icon-container">
                  <FaLeaf className="impact-icon" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;


import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ENDPOINTS, getEnterpriseHeaders, buildEnterpriseUrl } from '../../utils/api';
import { calculateMonthOverMonthGrowth, sortMonthsChronologically } from '../../utils/environmentalImpact';
import { FaChartLine } from 'react-icons/fa';

// Define contact interface based on enterprise API response
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
      contacts: Contact[];
    }>;
  };
}

interface GrowthDataPoint {
  date: string;
  totalContacts: number;
}

const ContactGrowth: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState<number>(0);
  const [totalContacts, setTotalContacts] = useState<number>(0);
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setLoading(true);
        
        // Use enterprise contacts endpoint
        const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CONTACTS);
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const responseData: EnterpriseContactsResponse = await response.json();
        
        // Extract contacts array from all departments
        let contactList: Contact[] = [];
        
        if (responseData && responseData.data && responseData.data.departmentStats) {
          // Flatten contacts from all departments
          Object.values(responseData.data.departmentStats).forEach(department => {
            if (department.contacts && Array.isArray(department.contacts)) {
              contactList.push(...department.contacts);
            }
          });
        }
        
        if (contactList.length === 0) {
          // Sample data if no contacts found
          generateSampleData();
          return;
        }
        
        // Process contacts to get growth data
        processContactGrowthData(contactList);
        
      } catch (err) {
        console.error('Error fetching contact data:', err);
        setError('Failed to load contact growth data');
        generateSampleData(); // Generate sample data on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchContactData();
  }, []);
  // Generate sample data for demonstration when real data isn't available
  const generateSampleData = () => {
    const sampleData: GrowthDataPoint[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyNewContacts: number[] = [];
    let count = 5;
    
    months.forEach(month => {
      // Generate random new contacts for each month (between 1 and 10)
      const newContacts = Math.floor(Math.random() * 10) + 1;
      monthlyNewContacts.push(newContacts);
      count += newContacts;
      sampleData.push({
        date: month,
        totalContacts: count
      });
    });
    
    setGrowthData(sampleData);
    setTotalContacts(count);
    
    // Calculate growth percentage based on new contacts added (not cumulative totals)
    if (monthlyNewContacts.length >= 2) {
      const lastMonthNew = monthlyNewContacts[monthlyNewContacts.length - 1];
      const previousMonthNew = monthlyNewContacts[monthlyNewContacts.length - 2];
        let growth = 0;
      if (previousMonthNew > 0) {
        growth = calculateMonthOverMonthGrowth(lastMonthNew, previousMonthNew);
      } else if (lastMonthNew > 0) {
        growth = 100;
      }
      
      setGrowthPercentage(growth);
    } else {
      setGrowthPercentage(0);
    }
  };
    // Process real contact data to generate growth chart data
  const processContactGrowthData = (contacts: Contact[]) => {
    // Sort contacts by creation date
    const sortedContacts = [...contacts].sort((a, b) => {
      const dateA = getDateFromCreatedAt(a.createdAt);
      const dateB = getDateFromCreatedAt(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Group contacts by month for counting new additions
    const monthlyNewContacts: { [key: string]: number } = {};
    const monthlyRunningTotals: { [key: string]: number } = {};
    let runningTotal = 0;
    
    sortedContacts.forEach(contact => {
      try {
        const date = getDateFromCreatedAt(contact.createdAt);
        
        // Skip invalid dates
        if (isNaN(date.getTime())) return;
        
        // Format as Month Year (e.g., "Jan 2023")
        const monthYearKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        // Count new contacts for this month
        if (!monthlyNewContacts[monthYearKey]) {
          monthlyNewContacts[monthYearKey] = 0;
        }
        monthlyNewContacts[monthYearKey]++;
        
        // Increment running total
        runningTotal++;
        
        // Store the running total for this month
        monthlyRunningTotals[monthYearKey] = runningTotal;
      } catch (err) {
        console.warn('Could not process date for contact:', contact.createdAt);
      }
    });
      // Sort months chronologically
    const sortedMonths = Object.keys(monthlyRunningTotals).sort(sortMonthsChronologically);
    
    // Convert to array format for chart with running totals
    const growthDataPoints: GrowthDataPoint[] = sortedMonths.map(month => ({
      date: month,
      totalContacts: monthlyRunningTotals[month]
    }));
    
    // Take the last 6 months if we have more data
    const recentData = growthDataPoints.slice(-6);
    
    setGrowthData(recentData);
    setTotalContacts(runningTotal);
    
    // Calculate month-over-month growth percentage based on new contacts added
    if (recentData.length >= 2) {
      // Get the corresponding months for new contact calculation
      const lastMonth = recentData[recentData.length - 1].date;
      const previousMonth = recentData[recentData.length - 2].date;
      
      const newContactsLastMonth = monthlyNewContacts[lastMonth] || 0;
      const newContactsPreviousMonth = monthlyNewContacts[previousMonth] || 0;
      
      // Use utility function for consistent growth calculation
      const growth = calculateMonthOverMonthGrowth(newContactsLastMonth, newContactsPreviousMonth);
      setGrowthPercentage(growth);
    } else {
      setGrowthPercentage(0);
    }
  };    // Helper function to handle different date formats
  const getDateFromCreatedAt = (createdAt: { _seconds: number, _nanoseconds: number }): Date => {
    try {
      // Handle Firebase timestamp format
      if (createdAt && '_seconds' in createdAt) {
        const timestamp = createdAt._seconds * 1000;
        const date = new Date(timestamp);
        
        // Validate the date is reasonable (not before 2020 or in the far future)
        if (date.getFullYear() < 2020 || date.getFullYear() > new Date().getFullYear() + 1) {
          console.warn("Invalid date detected:", date, "from timestamp:", timestamp);
          return new Date('invalid');
        }
        
        return date;
      }
    } catch (e) {
      console.warn("Failed to parse Firebase timestamp:", createdAt, e);
    }
    
    // Return an invalid date if we can't parse
    return new Date('invalid');
  };

  return (
    <div className="contact-growth-container">
      <div className="metric-header">
        <div className="metric-label">Contact Growth</div>
        <div className="metric-icon-container orange">
          <FaChartLine />
        </div>
      </div>
      <div className="metric-value">{loading ? "Loading..." : totalContacts}</div>
      <div className={`metric-change ${growthPercentage >= 0 ? 'positive' : 'negative'}`}>
        <span className="arrow">{growthPercentage >= 0 ? '↑' : '↓'}</span> 
        {Math.abs(growthPercentage)}% {growthPercentage >= 0 ? 'increase' : 'decrease'}
      </div>
      
      <div className="growth-chart" style={{ width: '100%', height: 120, marginTop: 15 }}>
        {loading ? (
          <div className="loading-indicator">Loading growth data...</div>
        ) : error ? (
          <div className="error-indicator">{error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="totalContacts" 
                stroke="#ff8A65" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ContactGrowth; 
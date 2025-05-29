import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ENDPOINTS, getEnterpriseHeaders, API_BASE_URL } from '../../utils/api';
import { FaChartLine } from 'react-icons/fa';

// User ID specifically for contacts
const CONTACTS_USER_ID = "EccyMCv7uiS1eYHB3ZMu6zRR1DG2";

interface Contact {
  createdAt: string | { _seconds: number, _nanoseconds: number };
  [key: string]: any;
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
        
        // Use the endpoint for contacts
        const url = `${API_BASE_URL}/Contacts/${CONTACTS_USER_ID}`;
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Extract contacts array
        let contactList: Contact[] = [];
        
        if (responseData && responseData.contactList && Array.isArray(responseData.contactList)) {
          contactList = responseData.contactList;
        } else if (Array.isArray(responseData)) {
          contactList = responseData;
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
    let count = 5;
    
    months.forEach(month => {
      count += Math.floor(Math.random() * 10) + 1;
      sampleData.push({
        date: month,
        totalContacts: count
      });
    });
    
    setGrowthData(sampleData);
    setTotalContacts(count);
    
    // Calculate growth percentage from last two months
    const lastMonthContacts = sampleData[sampleData.length - 1].totalContacts;
    const previousMonthContacts = sampleData[sampleData.length - 2].totalContacts;
    const growth = ((lastMonthContacts - previousMonthContacts) / previousMonthContacts) * 100;
    setGrowthPercentage(Math.round(growth * 10) / 10);
  };
  
  // Process real contact data to generate growth chart data
  const processContactGrowthData = (contacts: Contact[]) => {
    // Sort contacts by creation date
    const sortedContacts = [...contacts].sort((a, b) => {
      const dateA = getDateFromCreatedAt(a.createdAt);
      const dateB = getDateFromCreatedAt(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Group contacts by month
    const monthlyData: { [key: string]: number } = {};
    let runningTotal = 0;
    
    sortedContacts.forEach(contact => {
      try {
        const date = getDateFromCreatedAt(contact.createdAt);
        
        // Skip invalid dates
        if (isNaN(date.getTime())) return;
        
        // Format as Month Year (e.g., "Jan 2023")
        const monthYearKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        // Increment running total
        runningTotal++;
        
        // Store the running total for this month
        monthlyData[monthYearKey] = runningTotal;
      } catch (err) {
        console.warn('Could not process date for contact:', contact.createdAt);
      }
    });
    
    // Convert to array format for chart
    const growthDataPoints: GrowthDataPoint[] = Object.keys(monthlyData).map(date => ({
      date,
      totalContacts: monthlyData[date]
    }));
    
    // Take the last 6 months if we have more data
    const recentData = growthDataPoints.slice(-6);
    
    setGrowthData(recentData);
    setTotalContacts(runningTotal);
    
    // Calculate growth percentage if we have at least 2 data points
    if (recentData.length >= 2) {
      const lastMonthContacts = recentData[recentData.length - 1].totalContacts;
      const previousMonthContacts = recentData[recentData.length - 2].totalContacts;
      const growth = ((lastMonthContacts - previousMonthContacts) / previousMonthContacts) * 100;
      setGrowthPercentage(Math.round(growth * 10) / 10);
    } else {
      setGrowthPercentage(0);
    }
  };
  
  // Helper function to handle different date formats
  const getDateFromCreatedAt = (createdAt: string | { _seconds: number, _nanoseconds: number }): Date => {
    if (typeof createdAt === 'string') {
      // Try to parse the date string
      let dateStr = createdAt;
      if (dateStr.includes('at at')) {
        // Handle the specific format like "May 11 2025 at at 1:51:57 AM GMT+2"
        dateStr = dateStr.replace('at at', 'at');
      }
      return new Date(dateStr);
    } else if (createdAt && '_seconds' in createdAt) {
      // Handle Firebase timestamp format
      return new Date(createdAt._seconds * 1000);
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
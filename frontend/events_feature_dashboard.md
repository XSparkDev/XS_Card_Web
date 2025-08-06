# Events Feature Dashboard - Backend Integration Guide

## Overview
This document outlines the backend requirements for the Events Feature Dashboard implementation. The frontend displays event analytics across two main expandable cards: **Event Performance Metrics** and **Event Types & Attendance**.

## API Endpoints Required

### 1. Event Performance Metrics Endpoint
**Endpoint:** `GET /api/events/performance-metrics/{enterpriseId}`

**Description:** Returns internal event performance metrics for analytics dashboard

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "X-Enterprise-ID": "{enterpriseId}",
  "Content-Type": "application/json"
}
```

**Response Format:**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "enterpriseId": "string",
    "enterpriseName": "string",
    "metrics": [
      {
        "metric": "Attendance Rate",
        "value": 847,
        "percentage": 92.3,
        "trend": 5.2,
        "icon": "attendance",
        "description": "Percentage of registered attendees who actually attended events",
        "lastUpdated": "2024-01-15T10:30:00Z"
      },
      {
        "metric": "Satisfaction Score",
        "value": 4.7,
        "percentage": 94.0,
        "trend": 2.1,
        "icon": "satisfaction",
        "description": "Average satisfaction rating from post-event surveys (1-5 scale)",
        "lastUpdated": "2024-01-15T10:30:00Z"
      },
      {
        "metric": "Registration Rate",
        "value": 1203,
        "percentage": 78.5,
        "trend": -1.3,
        "icon": "registration",
        "description": "Percentage of invited users who registered for events",
        "lastUpdated": "2024-01-15T10:30:00Z"
      },
      {
        "metric": "Completion Rate",
        "value": 592,
        "percentage": 87.1,
        "trend": 3.8,
        "icon": "completion",
        "description": "Percentage of attendees who completed the full event",
        "lastUpdated": "2024-01-15T10:30:00Z"
      }
    ],
    "summary": {
      "avgPerformance": 88.5,
      "improvingMetrics": 3,
      "totalMetrics": 4,
      "bestMetric": "Satisfaction Score",
      "worstMetric": "Registration Rate",
      "bestTrend": "Attendance Rate"
    }
  }
}
```

### 2. Event Types & Attendance Endpoint
**Endpoint:** `GET /api/events/types-attendance/{enterpriseId}`

**Description:** Returns event type breakdown and attendance analytics

**Headers:**
```json
{
  "Authorization": "Bearer {token}",
  "X-Enterprise-ID": "{enterpriseId}",
  "Content-Type": "application/json"
}
```

**Response Format:**
```json
{
  "success": true,
  "cached": false,
  "data": {
    "enterpriseId": "string",
    "enterpriseName": "string",
    "eventTypes": [
      {
        "eventType": "Conferences",
        "count": 8,
        "attendees": 2400,
        "color": "#3b82f6",
        "avgAttendance": 300,
        "attendanceRate": 26.9,
        "eventFrequency": 12.9,
        "description": "Large-scale professional conferences and summits"
      },
      {
        "eventType": "Workshops",
        "count": 15,
        "attendees": 450,
        "color": "#10b981",
        "avgAttendance": 30,
        "attendanceRate": 5.0,
        "eventFrequency": 24.2,
        "description": "Hands-on training and skill development sessions"
      },
      {
        "eventType": "Networking",
        "count": 12,
        "attendees": 960,
        "color": "#f59e0b",
        "avgAttendance": 80,
        "attendanceRate": 10.8,
        "eventFrequency": 19.4,
        "description": "Professional networking and relationship building events"
      },
      {
        "eventType": "Webinars",
        "count": 22,
        "attendees": 3300,
        "color": "#8b5cf6",
        "avgAttendance": 150,
        "attendanceRate": 37.0,
        "eventFrequency": 35.5,
        "description": "Online educational and informational sessions"
      },
      {
        "eventType": "Trade Shows",
        "count": 5,
        "attendees": 1800,
        "color": "#ef4444",
        "avgAttendance": 360,
        "attendanceRate": 20.2,
        "eventFrequency": 8.1,
        "description": "Industry exhibitions and product showcases"
      }
    ],
    "analytics": {
      "totalEvents": 62,
      "totalAttendees": 8910,
      "avgEngagement": 88.5,
      "topEvent": "Webinars",
      "mostPopular": "Webinars",
      "mostFrequent": "Webinars",
      "bestAvgAttendance": "Trade Shows"
    }
  }
}
```

## Data Model Requirements

### Event Performance Metrics
```typescript
interface EventEngagement {
  metric: string;           // Display name of the metric
  value: number;           // Raw value (count, score, etc.)
  percentage: number;      // Performance percentage (0-100)
  trend: number;          // Percentage change from previous period
  icon: string;           // Icon identifier for frontend
  description?: string;    // Optional description for tooltips
  lastUpdated: string;    // ISO timestamp of last update
}
```

### Event Types Data
```typescript
interface EventDesign {
  eventType: string;       // Type of event
  count: number;          // Number of events of this type
  attendees: number;      // Total attendees for this type
  color: string;          // Hex color code for UI
  avgAttendance: number;  // Average attendance per event
  attendanceRate: number; // Percentage of total attendees
  eventFrequency: number; // Percentage of total events
  description?: string;   // Optional description
}
```

### Analytics Summary
```typescript
interface EventAnalytics {
  totalEvents: number;     // Total number of events
  totalAttendees: number;  // Total number of attendees
  avgEngagement: number;   // Average engagement percentage
  topEvent: string;       // Most attended event type
  mostPopular: string;    // Event type with most attendees
  mostFrequent: string;   // Most common event type
  bestAvgAttendance: string; // Event type with best average
}
```

## Database Schema Recommendations

### Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    enterprise_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    max_capacity INTEGER,
    registration_count INTEGER DEFAULT 0,
    attendance_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    satisfaction_score DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Event Registrations Table
```sql
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    user_id UUID NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5)
);
```

### Event Invitations Table
```sql
CREATE TABLE event_invitations (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id),
    user_id UUID NOT NULL,
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded BOOLEAN DEFAULT FALSE,
    response_type VARCHAR(20) -- 'accepted', 'declined', 'maybe'
);
```

## Calculation Logic

### Performance Metrics Calculations

#### 1. Attendance Rate
```sql
-- Calculate attendance rate for the enterprise
SELECT 
    COUNT(CASE WHEN er.attended = true THEN 1 END) as attended_count,
    COUNT(*) as total_registrations,
    (COUNT(CASE WHEN er.attended = true THEN 1 END) * 100.0 / COUNT(*)) as attendance_rate
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE e.enterprise_id = :enterpriseId
AND e.start_date >= :period_start
AND e.start_date <= :period_end;
```

#### 2. Satisfaction Score
```sql
-- Calculate average satisfaction score
SELECT 
    AVG(satisfaction_rating) as avg_satisfaction,
    COUNT(satisfaction_rating) as response_count,
    (AVG(satisfaction_rating) * 20) as satisfaction_percentage -- Convert 1-5 to 0-100%
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE e.enterprise_id = :enterpriseId
AND er.satisfaction_rating IS NOT NULL
AND e.start_date >= :period_start
AND e.start_date <= :period_end;
```

#### 3. Registration Rate
```sql
-- Calculate registration rate (registered vs invited)
SELECT 
    COUNT(DISTINCT er.user_id) as registered_count,
    COUNT(DISTINCT ei.user_id) as invited_count,
    (COUNT(DISTINCT er.user_id) * 100.0 / COUNT(DISTINCT ei.user_id)) as registration_rate
FROM event_invitations ei
LEFT JOIN event_registrations er ON ei.event_id = er.event_id AND ei.user_id = er.user_id
JOIN events e ON ei.event_id = e.id
WHERE e.enterprise_id = :enterpriseId
AND e.start_date >= :period_start
AND e.start_date <= :period_end;
```

#### 4. Completion Rate
```sql
-- Calculate completion rate (completed vs attended)
SELECT 
    COUNT(CASE WHEN er.completed = true THEN 1 END) as completed_count,
    COUNT(CASE WHEN er.attended = true THEN 1 END) as attended_count,
    (COUNT(CASE WHEN er.completed = true THEN 1 END) * 100.0 / 
     COUNT(CASE WHEN er.attended = true THEN 1 END)) as completion_rate
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE e.enterprise_id = :enterpriseId
AND e.start_date >= :period_start
AND e.start_date <= :period_end;
```

### Trend Calculations
```sql
-- Calculate trend percentage (current period vs previous period)
WITH current_period AS (
    SELECT metric_value FROM calculated_metrics 
    WHERE period = :current_period AND metric_name = :metric_name
),
previous_period AS (
    SELECT metric_value FROM calculated_metrics 
    WHERE period = :previous_period AND metric_name = :metric_name
)
SELECT 
    ((c.metric_value - p.metric_value) * 100.0 / p.metric_value) as trend_percentage
FROM current_period c, previous_period p;
```

## Caching Strategy

### Cache Keys
- `events:performance:{enterpriseId}:{period}` (TTL: 1 hour)
- `events:types:{enterpriseId}:{period}` (TTL: 1 hour)

### Cache Invalidation
- Invalidate when new event is created/updated
- Invalidate when registration/attendance data changes
- Invalidate when satisfaction ratings are submitted

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "EVENT_DATA_NOT_FOUND",
    "message": "No event data found for the specified enterprise",
    "details": "Enterprise ID: 123 has no events in the specified period"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes
- `EVENT_DATA_NOT_FOUND`: No events found for enterprise
- `INVALID_ENTERPRISE_ID`: Enterprise ID not found
- `INSUFFICIENT_PERMISSIONS`: User lacks access to event data
- `CALCULATION_ERROR`: Error in metric calculations
- `CACHE_ERROR`: Cache retrieval/storage error

## Performance Considerations

### Indexing Requirements
```sql
-- Essential indexes for performance
CREATE INDEX idx_events_enterprise_date ON events(enterprise_id, start_date);
CREATE INDEX idx_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_registrations_attended ON event_registrations(event_id, attended);
CREATE INDEX idx_invitations_event ON event_invitations(event_id);
```

### Query Optimization
- Use appropriate date ranges to limit data scope
- Implement pagination for large datasets
- Use database views for complex calculations
- Consider materialized views for frequently accessed metrics

## Data Refresh Schedule

### Real-time Updates
- Registration counts
- Attendance status during events

### Batch Updates (Hourly)
- Performance metric calculations
- Trend analysis
- Cache refresh

### Daily Updates
- Historical trend data
- Satisfaction score aggregations
- Event type analytics

## Security Requirements

### Data Access Control
- Ensure users can only access their enterprise data
- Implement row-level security for multi-tenant architecture
- Validate enterprise ID against user permissions

### Data Privacy
- Anonymize individual user data in aggregations
- Implement data retention policies
- Ensure GDPR compliance for user data

## Testing Requirements

### Unit Tests
- Test each calculation function independently
- Verify edge cases (zero attendees, no ratings, etc.)
- Test error handling scenarios

### Integration Tests
- Test full API endpoints with sample data
- Verify cache behavior
- Test concurrent access scenarios

### Performance Tests
- Load test with enterprise-scale data
- Verify query performance with large datasets
- Test cache effectiveness

## Sample Data for Development

### Events Sample Data
```json
[
  {
    "title": "Q1 Sales Conference",
    "event_type": "Conferences",
    "max_capacity": 500,
    "registration_count": 450,
    "attendance_count": 420,
    "completion_count": 400,
    "satisfaction_score": 4.7
  },
  {
    "title": "Leadership Workshop",
    "event_type": "Workshops",
    "max_capacity": 50,
    "registration_count": 45,
    "attendance_count": 42,
    "completion_count": 38,
    "satisfaction_score": 4.5
  }
]
```

## Monitoring and Alerting

### Key Metrics to Monitor
- API response times
- Cache hit rates
- Calculation accuracy
- Data freshness

### Alert Conditions
- API response time > 2 seconds
- Cache miss rate > 20%
- Data calculation errors
- Missing event data for active enterprises

## Migration Strategy

### Phase 1: Basic Implementation
- Implement core endpoints
- Basic metric calculations
- Simple caching

### Phase 2: Enhanced Features
- Advanced trend analysis
- Real-time updates
- Performance optimizations

### Phase 3: Advanced Analytics
- Predictive metrics
- Comparative analysis
- Custom reporting

This documentation provides a comprehensive guide for implementing the backend services required to support the Events Feature Dashboard. The frontend expects this exact data structure and format for proper functionality.
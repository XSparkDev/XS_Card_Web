import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from "../UI/card";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../UI/dialog";
import { Badge } from "../UI/badge";
import { Checkbox } from "../UI/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/UI/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/UI/selectRadix";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, FIREBASE_TOKEN, API_BASE_URL, DEFAULT_ENTERPRISE_ID, buildUrl } from "../../utils/api";
import SecurityAlerts from './SecurityAlerts';
import "../../styles/UserManagement.css";
import "../../styles/BusinessCards.css";

// Define a type for icon names
type IconName = 
  | "Search"
  | "UserPlus" 
  | "MoreVertical" 
  | "UserCheck"
  | "UserX"
  | "Mail"
  | "Shield"
  | "Clock"
  | "RefreshCw"
  | "Filter"
  | "Download"
  | "AlertTriangle"
  | "LogOut"
  | "Eye";

// Custom icons to replace lucide-react
const IconComponent = ({ 
  name, 
  className = "", 
  ...props 
}: { 
  name: IconName; 
  className?: string; 
} & React.SVGProps<SVGSVGElement>) => {
  const icons = {
    Search: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    UserPlus: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>,
    MoreVertical: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
    UserCheck: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
    UserX: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>,
    Mail: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    Shield: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Clock: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    RefreshCw: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>,
    Filter: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    Download: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
    AlertTriangle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
    LogOut: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
    Eye: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
  };

  return icons[name] || null;
};

// Define a user type
interface User {
  id: number;
  userId?: string; // Firebase user ID
  name: string;
  email: string;
  role: string;
  department: string;
  departmentId?: string; // Add department ID for API calls
  status: string;
  lastActive: string;
}

// Email data structure for backend
interface EmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: {
    filename: string;
    content: string; // base64 encoded
    contentType: string;
  }[];
  priority?: 'low' | 'normal' | 'high';
  isHtml?: boolean;
}



// Send Email Modal Component
const SendEmailModal = ({ user, users, onClose }: { user: User | null; users: User[]; onClose: () => void }) => {
  // Check if this is a bulk email operation
  const bulkEmailUsers = JSON.parse(localStorage.getItem('bulkEmailUsers') || '[]') as User[];
  const isBulkEmail = bulkEmailUsers.length > 1;
  
  const [emailData, setEmailData] = useState<EmailData>({
    to: isBulkEmail ? bulkEmailUsers.map(u => u.email) : (user ? [user.email] : []),
    cc: [],
    subject: '',
    body: '',
    isHtml: false,
    priority: 'normal'
  });
  const [ccInput, setCcInput] = useState('');
  const [showCcDropdown, setShowCcDropdown] = useState(false);
  const [bccInput, setBccInput] = useState('');
  const [showBccDropdown, setShowBccDropdown] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleInputChange = (field: keyof EmailData, value: any) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCcEmail = () => {
    if (ccInput.trim() && ccInput.includes('@')) {
      setEmailData(prev => ({
        ...prev,
        cc: [...(prev.cc || []), ccInput.trim()]
      }));
      setCcInput('');
    }
  };

  const removeCcEmail = (index: number) => {
    setEmailData(prev => ({
      ...prev,
      cc: prev.cc?.filter((_, i) => i !== index) || []
    }));
  };

  const addBccEmail = () => {
    if (bccInput.trim() && bccInput.includes('@')) {
      setEmailData(prev => ({
        ...prev,
        bcc: [...(prev.bcc || []), bccInput.trim()]
      }));
      setBccInput('');
    }
  };

  const removeBccEmail = (index: number) => {
    setEmailData(prev => ({
      ...prev,
      bcc: prev.bcc?.filter((_, i) => i !== index) || []
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.cc-dropdown-container')) {
        setShowCcDropdown(false);
      }
      if (!target.closest('.bcc-dropdown-container')) {
        setShowBccDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async () => {
    try {
      setSendingEmail(true);
      
      // Convert attachments to base64
      const processedAttachments = await Promise.all(
        attachments.map(async (file) => {
          return new Promise<{ filename: string; content: string; contentType: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve({
                filename: file.name,
                content: base64,
                contentType: file.type
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const finalEmailData: EmailData = {
        ...emailData,
        attachments: processedAttachments
      };

      console.log('Email data to be sent to backend:', finalEmailData);
      
      // Get Firebase token
      const firebaseToken = FIREBASE_TOKEN;
      
      const response = await fetch('http://localhost:8383/enterprise/email/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify(finalEmailData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Email send response:', result);

      if (result.status) {
        alert('Email sent successfully!');
        onClose();
      } else {
        throw new Error(result.message || 'Failed to send email');
      }

    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!user) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px', width: '95vw', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h2>{isBulkEmail ? `Send Email - ${bulkEmailUsers.length} Recipients` : 'Send Email'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
          {/* Recipient Info */}
          <div style={{
            background: isBulkEmail ? '#f0fdf4' : '#f0f9ff',
            border: `1px solid ${isBulkEmail ? '#10b981' : '#0ea5e9'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            {isBulkEmail ? (
              <div>
                <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.5rem' }}>
                  Bulk Email - {bulkEmailUsers.length} Recipients
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Recipients: {bulkEmailUsers.map(u => u.name).join(', ')}
                </div>
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '6px', 
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#92400e'
                }}>
                  💡 <strong>Tip:</strong> Each recipient will receive the email individually. Use CC/BCC for department-wide visibility.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#0ea5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#0c4a6e' }}>{user.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#075985' }}>{user.email}</div>
                </div>
              </div>
            )}
          </div>

          {/* Email Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* To Field */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                To
              </label>
              <input
                type="email"
                value={emailData.to[0] || ''}
                onChange={(e) => handleInputChange('to', [e.target.value])}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* CC Field */}
            <div style={{ position: 'relative' }} className="cc-dropdown-container">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                CC (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="email"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  placeholder="Enter email address or select from employees"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addCcEmail()}
                  onFocus={() => setShowCcDropdown(true)}
                />
                <Button
                  onClick={() => setShowCcDropdown(!showCcDropdown)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#374151'
                  }}
                >
                  Select
                </Button>
                <Button
                  onClick={addCcEmail}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#3b82f6',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                >
                  Add
                </Button>
              </div>
              
              {/* Employee Dropdown */}
              {showCcDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  marginTop: '0.25rem'
                }}>
                  {users
                    .filter(u => u.email !== user?.email) // Exclude the primary recipient
                    .map((employee) => (
                      <div
                        key={employee.id}
                        onClick={() => {
                          setEmailData(prev => ({
                            ...prev,
                            cc: [...(prev.cc || []), employee.email]
                          }));
                          setShowCcDropdown(false);
                        }}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                            {employee.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {emailData.cc && emailData.cc.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {emailData.cc.map((email, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: '#e5e7eb',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {email}
                      <button
                        onClick={() => removeCcEmail(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BCC Field */}
            <div style={{ position: 'relative' }} className="bcc-dropdown-container">
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                BCC (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="email"
                  value={bccInput}
                  onChange={(e) => setBccInput(e.target.value)}
                  placeholder="Enter email address or select from employees"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addBccEmail()}
                  onFocus={() => setShowBccDropdown(true)}
                />
                <Button
                  onClick={() => setShowBccDropdown(!showBccDropdown)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    color: '#374151'
                  }}
                >
                  Select
                </Button>
                <Button
                  onClick={addBccEmail}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#6b7280',
                    border: '1px solid #6b7280',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                >
                  Add
                </Button>
              </div>
              
              {/* Employee Dropdown for BCC */}
              {showBccDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  marginTop: '0.25rem'
                }}>
                  {users
                    .filter(u => u.email !== user?.email) // Exclude the primary recipient
                    .map((employee) => (
                      <div
                        key={employee.id}
                        onClick={() => {
                          setEmailData(prev => ({
                            ...prev,
                            bcc: [...(prev.bcc || []), employee.email]
                          }));
                          setShowBccDropdown(false);
                        }}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                            {employee.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              
              {emailData.bcc && emailData.bcc.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {emailData.bcc.map((email, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: '#f3f4f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {email}
                      <button
                        onClick={() => removeBccEmail(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Field */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Subject
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter email subject"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Priority */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Priority
              </label>
              <select
                value={emailData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Attachments */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              />
              {attachments.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Body Field */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem',
                color: '#374151'
              }}>
                Message
              </label>
              <textarea
                value={emailData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                placeholder="Enter your message here..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={sendingEmail}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={sendingEmail || !emailData.subject || !emailData.body}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                backgroundColor: '#0ea5e9',
                borderColor: '#0ea5e9',
                color: 'white'
              }}
            >
              {sendingEmail ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Sending...
                </div>
              ) : (
                'Send Email'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// View Profile Modal Component
const ViewProfileModal = ({ user, onClose }: { user: User | null; onClose: () => void }) => {
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [teamData, setTeamData] = useState<any>(null);
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [leaderName, setLeaderName] = useState<string | null>(null);
  const [loadingDepartment, setLoadingDepartment] = useState(false);
  const [loadingLeader, setLoadingLeader] = useState(false);

  // Fetch employee data from enterprise API
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Use enterprise ID from API utils and department ID from user data
        const enterpriseId = DEFAULT_ENTERPRISE_ID;
        const departmentId = user.departmentId || 'default-department-id';
        
        // Use the user's ID as employee ID
        const employeeId = user.id.toString();

        const url = `${API_BASE_URL}/enterprise/${enterpriseId}/departments/${departmentId}/employees/${employeeId}`;
        const headers = getEnterpriseHeaders();
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch employee data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Employee data:', data);
        
        // Extract employee data from the response structure
        if (data.success && data.employee) {
          setEmployeeData(data.employee);
        } else {
          setEmployeeData(data);
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load employee profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [user?.id, user?.departmentId]); // Only re-run when user ID or department ID changes

  // Fetch team details
  const handleTeamClick = async () => {
    if (!employeeData?.teamId || loadingTeam) return;

    try {
      setLoadingTeam(true);
      setShowTeamModal(true);
      
      // Reset department and leader names
      setDepartmentName(null);
      setLeaderName(null);

      const enterpriseId = DEFAULT_ENTERPRISE_ID;
      const departmentId = user?.departmentId || 'default-department-id';
      
      const url = `${API_BASE_URL}/enterprise/${enterpriseId}/departments/${departmentId}/teams/${employeeData.teamId}`;
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Team data:', data);
      
      // Extract team data from the response structure
      let team = null;
      if (data.success && data.team) {
        team = data.team;
        setTeamData(data.team);
      } else {
        team = data;
        setTeamData(data);
      }

      // Fetch department and leader names if team data is available
      if (team) {
        if (team.departmentId) {
          fetchDepartmentName(team.departmentId);
        }
        if (team.leaderId) {
          fetchLeaderName(team.leaderId);
        }
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
      alert('Failed to load team details. Please try again.');
    } finally {
      setLoadingTeam(false);
    }
  };

  // Fetch department name
  const fetchDepartmentName = async (departmentId: string) => {
    if (!departmentId || loadingDepartment) return;

    try {
      setLoadingDepartment(true);
      const enterpriseId = DEFAULT_ENTERPRISE_ID;
      const url = `${API_BASE_URL}/enterprise/${enterpriseId}/departments/${departmentId}`;
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch department data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Department data:', data);
      
      // Extract department name from the response structure
      if (data.success && data.department) {
        setDepartmentName(data.department.name || data.department.id);
      } else if (data.name) {
        setDepartmentName(data.name);
      } else {
        setDepartmentName(departmentId);
      }
    } catch (err) {
      console.error('Error fetching department data:', err);
      setDepartmentName(departmentId); // Fallback to ID if fetch fails
    } finally {
      setLoadingDepartment(false);
    }
  };

  // Fetch leader name
  const fetchLeaderName = async (leaderId: string) => {
    if (!leaderId || loadingLeader) return;

    try {
      setLoadingLeader(true);
      const enterpriseId = DEFAULT_ENTERPRISE_ID;
      const departmentId = user?.departmentId || 'default-department-id';
      const url = `${API_BASE_URL}/enterprise/${enterpriseId}/departments/${departmentId}/employees/${leaderId}`;
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leader data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Leader data:', data);
      
      // Extract leader name from the response structure
      if (data.success && data.employee) {
        const leader = data.employee;
        setLeaderName(`${leader.name} ${leader.surname}`.trim() || leader.id);
      } else if (data.name && data.surname) {
        setLeaderName(`${data.name} ${data.surname}`.trim());
      } else if (data.name) {
        setLeaderName(data.name);
      } else {
        setLeaderName(leaderId);
      }
    } catch (err) {
      console.error('Error fetching leader data:', err);
      setLeaderName(leaderId); // Fallback to ID if fetch fails
    } finally {
      setLoadingLeader(false);
    }
  };

  // Fetch card count
  const handleCardClick = async () => {
    if ((!employeeData?.cardsRefPath && !employeeData?.cardsRef) || loadingCards) return;

    try {
      setLoadingCards(true);
      setShowCardModal(true);

      // Extract card ID from cardsRefPath (assuming it's a path like "cards/DW1QbgLTiCgFxOBbvPKdjlLvIgo1")
      const cardId = employeeData.cardsRefPath ? employeeData.cardsRefPath.split('/').pop() : employeeData.cardsRef?.split('/').pop();
      
      const url = `${API_BASE_URL}/Cards/${cardId}`;
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch card data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Card data:', data);
      
      // Count the number of cards based on the response structure
      let count = 0;
      if (data.success && data.cards && Array.isArray(data.cards)) {
        count = data.cards.length;
      } else if (Array.isArray(data)) {
        count = data.length;
      } else if (data.count) {
        count = data.count;
      }
      setCardCount(count);
    } catch (err) {
      console.error('Error fetching card data:', err);
      alert('Failed to load card details. Please try again.');
    } finally {
      setLoadingCards(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
          {/* Modern Header with Gradient */}
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-title">
              <h2>{user.name}</h2>
              <p className="profile-subtitle">{user.role} • {user.department}</p>
            </div>
            <button 
              onClick={onClose}
              className="modal-close"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              ×
            </button>
          </div>

          <div className="profile-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                  <span>Loading profile...</span>
              </div>
            ) : error ? (
              <div className="error-container">
                <IconComponent name="AlertTriangle" className="error-icon" />
                  <span>{error}</span>
              </div>
            ) : employeeData ? (
              <div className="profile-sections">
                {/* Employee Information Section */}
                <div className="profile-section">
                  <div className="section-header">
                    <IconComponent name="UserCheck" className="section-icon" />
                    <h3>Employee Information</h3>
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Name</label>
                      <div className="info-value">{employeeData.name || 'N/A'}</div>
                    </div>

                    <div className="info-item">
                      <label>Surname</label>
                      <div className="info-value">{employeeData.surname || 'N/A'}</div>
                    </div>

                    <div className="info-item">
                      <label>Email</label>
                      <div className="info-value">{employeeData.email || 'N/A'}</div>
                    </div>

                    <div className="info-item">
                      <label>Phone</label>
                      <div className="info-value">{employeeData.phone || 'N/A'}</div>
                    </div>

                    <div className="info-item">
                      <label>Role</label>
                      <div className="info-value">{employeeData.role || 'N/A'}</div>
                    </div>

                    <div className="info-item">
                      <label>Position</label>
                      <div className="info-value">{employeeData.position || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                {/* Quick Actions Section */}
                <div className="profile-section">
                  <div className="section-header">
                    <IconComponent name="Shield" className="section-icon" />
                    <h3>Quick Actions</h3>
                </div>

                  <div className="action-cards">
                    <button
                      onClick={handleTeamClick}
                      disabled={!employeeData.teamId || loadingTeam}
                      className={`action-card ${employeeData.teamId ? 'action-card-active' : 'action-card-disabled'}`}
                    >
                      <div className="action-icon action-icon-team">
                        <IconComponent name="Eye" style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                      <div className="action-content">
                        <div className="action-title">View Team Details</div>
                        <div className="action-subtitle">
                          {employeeData.teamId ? 'Click to see team information' : 'No team assigned'}
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleCardClick}
                      disabled={!employeeData.cardsRefPath && !employeeData.cardsRef || loadingCards}
                      className={`action-card ${(employeeData.cardsRefPath || employeeData.cardsRef) ? 'action-card-active' : 'action-card-disabled'}`}
                    >
                      <div className="action-icon">
                        <IconComponent name="Eye" style={{ width: '1.25rem', height: '1.25rem' }} />
                      </div>
                      <div className="action-content">
                        <div className="action-title">View Business Cards</div>
                        <div className="action-subtitle">
                          {(employeeData.cardsRefPath || employeeData.cardsRef) ? 'Click to see card details' : 'No cards available'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Account Status Section */}
                <div className="profile-section">
                  <div className="section-header">
                    <IconComponent name="Clock" className="section-icon" />
                    <h3>Account Status</h3>
                  </div>
                  
                  <div className="status-grid">
                    <div className="status-item">
                      <label>Status</label>
                      <div className={`status-badge status-${employeeData.isActive ? 'active' : 'inactive'}`}>
                        {employeeData.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="status-item">
                      <label>Employee ID</label>
                      <div className="info-value">{employeeData.employeeId || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Team Details Modal */}
      {showTeamModal && (
        <div className="modal-overlay" onClick={() => setShowTeamModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90vw' }}>
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                Team Details
              </h2>
              <button 
                onClick={() => setShowTeamModal(false)}
                className="modal-close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.5rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {loadingTeam ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '2rem',
                  color: '#6b7280'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #e5e7eb',
                      borderTop: '3px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Loading team details...</span>
                  </div>
                </div>
              ) : teamData ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}>
                    <h3 style={{
                      margin: '0 0 1rem 0',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1e40af'
                    }}>
                      {teamData.name}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '0.5rem',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          color: '#374151'
                        }}>
                          Description
                        </label>
                        <div style={{
                          padding: '0.75rem',
                          background: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          color: '#111827'
                        }}>
                          {teamData.description || 'No description available'}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '2rem',
                        flexWrap: 'wrap'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            color: '#374151'
                          }}>
                            Department
                          </label>
                          <div style={{
                            padding: '0.75rem',
                            background: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#111827',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {loadingDepartment ? (
                              <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #e5e7eb',
                                borderTop: '2px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }}></div>
                            ) : null}
                            {departmentName || teamData.departmentId || teamData.departmentRef || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            color: '#374151'
                          }}>
                            Members
                          </label>
                          <div style={{
                            padding: '0.75rem',
                            background: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#111827'
                          }}>
                            {teamData.memberCount || 0} member(s)
                          </div>
                        </div>
                      </div>
                      
                      {(teamData.leaderId || teamData.leaderRef) && (
                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            color: '#374151'
                          }}>
                            Department Head
                          </label>
                          <div style={{
                            padding: '0.75rem',
                            background: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#111827',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {loadingLeader ? (
                              <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #e5e7eb',
                                borderTop: '2px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }}></div>
                            ) : null}
                            {leaderName || teamData.leaderId || teamData.leaderRef || 'N/A'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '2rem',
                  color: '#ef4444',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <IconComponent name="AlertTriangle" style={{ width: '32px', height: '32px' }} />
                    <span>Failed to load team details</span>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button 
                variant="outline" 
                onClick={() => setShowTeamModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px'
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Card Details Modal */}
      {showCardModal && (
        <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90vw' }}>
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                Business Cards
              </h2>
              <button 
                onClick={() => setShowCardModal(false)}
                className="modal-close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.5rem'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {loadingCards ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '2rem',
                  color: '#6b7280'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #e5e7eb',
                      borderTop: '3px solid #10b981',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Loading card details...</span>
                  </div>
                </div>
              ) : cardCount !== null ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '2rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#f0fdf4',
                    border: '3px solid #10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: '#166534'
                  }}>
                    {cardCount}
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      Business Cards
                    </h3>
                    <p style={{
                      margin: 0,
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {cardCount === 1 ? '1 card available' : `${cardCount} cards available`}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '2rem',
                  color: '#ef4444',
                  textAlign: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <IconComponent name="AlertTriangle" style={{ width: '32px', height: '32px' }} />
                    <span>Failed to load card details</span>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button 
                variant="outline" 
                onClick={() => setShowCardModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px'
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  // Deactivate modal state
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  // Reset password modal state
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  // Send email modal state
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [userToEmail, setUserToEmail] = useState<User | null>(null);
  // Email logs state
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [showEmailLogs, setShowEmailLogs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  // View Profile modal state
  const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false);
  const [userToViewProfile, setUserToViewProfile] = useState<User | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Security alerts stats
  const [stats] = useState({
    totalCount: 0,
    unacknowledgedCount: 0,
    criticalCount: 0
  });



  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use the enterprise employees endpoint, request a higher limit, and include inactive/unassigned if supported
      const url = buildEnterpriseUrl(`${ENDPOINTS.ENTERPRISE_EMPLOYEES}?limit=200&includeInactive=true&includeUnassigned=true`);
      const headers = getEnterpriseHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the API response into our User interface format
      // Define interface for API employee data structure
      interface EmployeeData {
        id: number;
        userId?: string; // Firebase user ID
        firstName: string;
        lastName: string;
        name?: string;
        surname?: string;
        email: string;
        role?: string;
        departmentName?: string;
        status?: string;
        lastActive?: string;
        active?: boolean; // Legacy field
        isActive?: boolean; // Current field used in employees collection
        departmentId?: string; // Add department ID for API calls
      }

      // Define interface for the API response (support possible pagination fields)
      interface EmployeesResponse {
        employees: EmployeeData[];
        totalCount?: number;
        page?: number;
        limit?: number;
      }

      // Aggregate employees across pages if pagination is present
      let allEmployees: EmployeeData[] = (data as EmployeesResponse).employees || [];
      const totalCount = (data as EmployeesResponse).totalCount || allEmployees.length;
      const pageSize = (data as EmployeesResponse).limit || 200;
      let currentPage = (data as EmployeesResponse).page || 1;

      while (allEmployees.length < totalCount) {
        currentPage += 1;
        const nextUrl = buildEnterpriseUrl(`${ENDPOINTS.ENTERPRISE_EMPLOYEES}?limit=${pageSize}&page=${currentPage}&includeInactive=true&includeUnassigned=true`);
        const nextRes = await fetch(nextUrl, { headers });
        if (!nextRes.ok) break;
        const nextData: EmployeesResponse = await nextRes.json();
        const nextEmployees = Array.isArray(nextData.employees) ? nextData.employees : [];
        if (nextEmployees.length === 0) break;
        allEmployees = allEmployees.concat(nextEmployees);
      }

      const processedUsers = allEmployees.map((emp: EmployeeData) => ({
        id: emp.id,
        userId: emp.userId, // Include Firebase user ID
        name: emp.name && emp.surname ? `${emp.name} ${emp.surname}` : `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        role: emp.role || 'Employee',
        department: emp.departmentName || 'Unassigned',
        departmentId: emp.departmentId, // Include department ID for API calls
        // Note: We use isActive from employees collection for display, but will check users collection for actual status
        status: emp.isActive === false ? 'Inactive' : 'Active',
        lastActive: emp.lastActive || 'Never',
      }));

      // Check for duplicate IDs and log them
      const duplicateIds = processedUsers.filter((user, index, self) => 
        self.findIndex(u => u.id === user.id) !== index
      );
      if (duplicateIds.length > 0) {
        console.warn('Duplicate user IDs found:', duplicateIds.map(u => ({ id: u.id, name: u.name })));
      }
      
      // Debug: Log the actual role values to see what we're getting from the API
      console.log('API Response employees:', (data as EmployeesResponse).employees);
      console.log('Processed users with roles:', processedUsers.map(u => ({ name: u.name, role: u.role })));
      
      setUsers(processedUsers);
      
      // Extract unique departments for filtering
      const uniqueDepartments = [...new Set(processedUsers.map(user => user.department))];
      setDepartments(uniqueDepartments);
      
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);


  
  // Note: Department filtering is handled in getFilteredUsers function

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (id: number) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  // Get filtered users based on activeFilter
  const getFilteredUsers = () => {
    let filtered = [...users];
    
    // First apply department filter if selected
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(user => user.department === selectedDepartment);
    }
    
    // Then filter based on activeFilter
    switch (activeFilter) {
      case "administrators":
        filtered = filtered.filter(user => 
          user.role.toLowerCase().includes('admin') || 
          user.role.toLowerCase().includes('administrator')
        );
        break;
      case "managers":
        filtered = filtered.filter(user => 
          user.role.toLowerCase().includes('manager') || 
          user.role.toLowerCase().includes('lead')
        );
        break;
      case "employees":
        filtered = filtered.filter(user => 
          user.role.toLowerCase().includes('employee') || 
          user.role.toLowerCase().includes('staff') ||
          (!user.role.toLowerCase().includes('admin') && 
           !user.role.toLowerCase().includes('manager') && 
           !user.role.toLowerCase().includes('lead'))
        );
        break;
      case "active":
        filtered = filtered.filter(user => user.status === "Active");
        break;
      case "inactive":
        filtered = filtered.filter(user => user.status === "Inactive");
        break;
      case "pending":
        filtered = filtered.filter(user => user.status === "Pending");
        break;
      default:
        // All users, no filtering
        break;
    }
    
    // Then apply search term filter
    return filtered.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredUsers = getFilteredUsers();
  
  // Pagination logic (currently unused but kept for future use)
  // const indexOfLastUser = currentPage * usersPerPage;
  // const indexOfFirstUser = indexOfLastUser - usersPerPage;
  // const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  // const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // const handlePageChange = (pageNumber: number) => {
  //   setCurrentPage(pageNumber);
  // };

  // Get users filtered by department only (for counting purposes)
  const departmentFilteredUsers = selectedDepartment !== "all" 
    ? users.filter(user => user.department === selectedDepartment)
    : users;



  // Count users for each filter based on actual data (respecting department filter)
  const adminCount = departmentFilteredUsers.filter(user => 
    user.role.toLowerCase().includes('admin') || 
    user.role.toLowerCase().includes('administrator')
  ).length;
  const managerCount = departmentFilteredUsers.filter(user => 
    user.role.toLowerCase().includes('manager') || 
    user.role.toLowerCase().includes('lead')
  ).length;
  const employeeCount = departmentFilteredUsers.filter(user => 
    user.role.toLowerCase().includes('employee') || 
    user.role.toLowerCase().includes('staff') ||
    (!user.role.toLowerCase().includes('admin') && 
     !user.role.toLowerCase().includes('manager') && 
     !user.role.toLowerCase().includes('lead'))
  ).length;
  const activeCount = departmentFilteredUsers.filter(user => user.status === "Active").length;
  const inactiveCount = departmentFilteredUsers.filter(user => user.status === "Inactive").length;




  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Inactive": return "secondary";
      case "Pending": return "outline";
      default: return "outline";
    }
  };

  const openAddEmployeeModal = () => {
    setIsAddUserOpen(true);
  };

  // Handle deactivate/reactivate account
  const handleDeactivateUser = (user: User) => {
    setUserToDeactivate(user);
    setIsDeactivateModalOpen(true);
  };

  const handleReactivateUser = (user: User) => {
    setUserToDeactivate(user);
    setIsDeactivateModalOpen(true);
  };

  const confirmDeactivateUser = async () => {
    if (!userToDeactivate) return;

    try {
      setDeactivateLoading(true);
      
      const firebaseIdToken = FIREBASE_TOKEN;
      
      // Use isActive status from the employee data (no need to check users collection)
      const isCurrentlyActive = userToDeactivate.status === 'Active';
      
      console.log('Employee status check:', {
        userId: userToDeactivate.id,
        employeeDisplayStatus: userToDeactivate.status,
        isCurrentlyActive
      });
      
      // Deactivate or reactivate based on current status
      const endpoint = isCurrentlyActive ? ENDPOINTS.DEACTIVATE_USER : ENDPOINTS.REACTIVATE_USER;
      const url = `${API_BASE_URL}${endpoint}`;

      const payload = { 
        active: !isCurrentlyActive,
        targetUserId: userToDeactivate.id.toString()
      };
      


      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${firebaseIdToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`${isCurrentlyActive ? 'Deactivate' : 'Reactivate'} response:`, result);

      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userToDeactivate.id 
            ? { ...user, status: isCurrentlyActive ? 'Inactive' : 'Active' }
            : user
        )
      );

      // Close modal and reset state
      setIsDeactivateModalOpen(false);
      setUserToDeactivate(null);

      // Show success message
      const action = isCurrentlyActive ? 'deactivated' : 'reactivated';
      alert(`User account ${action} successfully`);

      // Force immediate re-render to update filter counts
      setCurrentPage(currentPage);

      // Refresh user list to ensure status is up to date
      setTimeout(() => {
        fetchUsers();
      }, 1000);

    } catch (error) {
      console.error(`Error ${userToDeactivate.status === 'Active' ? 'deactivating' : 'reactivating'} user:`, error);
      alert(`Failed to ${userToDeactivate.status === 'Active' ? 'deactivate' : 'reactivate'} user account. Please try again.`);
    } finally {
      setDeactivateLoading(false);
    }
  };

  const closeDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setUserToDeactivate(null);
  };

  // Handle reset password
  const handleResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setIsResetPasswordModalOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!userToResetPassword) return;

    try {
      setResetPasswordLoading(true);
      
      const response = await fetch('http://localhost:8383/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userToResetPassword.email
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Reset password response:', result);

      // Close modal and reset state
      setIsResetPasswordModalOpen(false);
      setUserToResetPassword(null);

      // Show success message
      alert('Password reset link has been sent to the user\'s email address.');

    } catch (error) {
      console.error('Error sending password reset:', error);
      alert('Failed to send password reset email. Please try again.');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const closeResetPasswordModal = () => {
    setIsResetPasswordModalOpen(false);
    setUserToResetPassword(null);
  };

  // Handle send email
  const handleSendEmail = (user: User) => {
    setUserToEmail(user);
    setIsSendEmailModalOpen(true);
  };

  const closeSendEmailModal = () => {
    setIsSendEmailModalOpen(false);
    setUserToEmail(null);
    // Clean up bulk email data
    localStorage.removeItem('bulkEmailUsers');
  };

  // Handle email logs
  const handleShowEmailLogs = async () => {
    try {
      setLoadingLogs(true);
      setShowEmailLogs(true);
      
      const firebaseToken = FIREBASE_TOKEN;
      const response = await fetch('http://localhost:8383/enterprise/email/logs?limit=50', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${firebaseToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Email logs response:', result);

      if (result.status) {
        setEmailLogs(result.data.emailLogs || []);
      } else {
        throw new Error(result.message || 'Failed to fetch email logs');
      }

    } catch (error) {
      console.error('Error fetching email logs:', error);
      alert('Failed to fetch email logs. Please try again.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const closeEmailLogs = () => {
    setShowEmailLogs(false);
    setEmailLogs([]);
  };

  // Handle view profile
  const handleViewProfile = (user: User) => {
    setUserToViewProfile(user);
    setIsViewProfileModalOpen(true);
  };

  const closeViewProfileModal = () => {
    setIsViewProfileModalOpen(false);
    setUserToViewProfile(null);
  };



  // Bulk Operations Handlers
  const handleBulkSendEmail = () => {
    const selectedUsersData = users.filter(user => selectedUsers.includes(user.id));
    if (selectedUsersData.length === 0) return;

    // For bulk email, we'll create a special modal that allows sending to multiple recipients
    setUserToEmail(selectedUsersData[0]); // Use first user as primary recipient
    setIsSendEmailModalOpen(true);
    
    // Store selected users for bulk email processing
    localStorage.setItem('bulkEmailUsers', JSON.stringify(selectedUsersData));
  };

  const handleBulkDeactivate = async () => {
    const selectedUsersData = users.filter(user => selectedUsers.includes(user.id));
    if (selectedUsersData.length === 0) return;

    // Check if all selected users are currently active
    const activeUsers = selectedUsersData.filter(user => user.status === 'Active');
    const inactiveUsers = selectedUsersData.filter(user => user.status === 'Inactive');
    
    let confirmMessage = '';
    let isDeactivating = true;
    
    if (activeUsers.length > 0 && inactiveUsers.length > 0) {
      // Mixed status - ask user what they want to do
      const action = window.confirm(
        `You have selected users with different statuses:\n\n` +
        `Active users (${activeUsers.length}): ${activeUsers.map(u => u.name).join(', ')}\n` +
        `Inactive users (${inactiveUsers.length}): ${inactiveUsers.map(u => u.name).join(', ')}\n\n` +
        `Click OK to deactivate active users, or Cancel to reactivate inactive users.`
      );
      
      if (action) {
        // Deactivate active users
        confirmMessage = `Are you sure you want to deactivate ${activeUsers.length} user account${activeUsers.length > 1 ? 's' : ''}?\n\n${activeUsers.map(u => u.name).join(', ')}`;
        isDeactivating = true;
      } else {
        // Reactivate inactive users
        confirmMessage = `Are you sure you want to reactivate ${inactiveUsers.length} user account${inactiveUsers.length > 1 ? 's' : ''}?\n\n${inactiveUsers.map(u => u.name).join(', ')}`;
        isDeactivating = false;
      }
    } else if (activeUsers.length > 0) {
      // All active users - deactivate them
      confirmMessage = `Are you sure you want to deactivate ${activeUsers.length} user account${activeUsers.length > 1 ? 's' : ''}?\n\n${activeUsers.map(u => u.name).join(', ')}`;
      isDeactivating = true;
    } else if (inactiveUsers.length > 0) {
      // All inactive users - reactivate them
      confirmMessage = `Are you sure you want to reactivate ${inactiveUsers.length} user account${inactiveUsers.length > 1 ? 's' : ''}?\n\n${inactiveUsers.map(u => u.name).join(', ')}`;
      isDeactivating = false;
    } else {
      alert('No users selected for bulk operation.');
      return;
    }
    
    if (!window.confirm(confirmMessage)) return;

    try {
      // Determine which users to process based on the action
      const usersToProcess = isDeactivating ? activeUsers : inactiveUsers;
      const userIds = usersToProcess.map(user => user.id.toString());
      
      console.log(`Bulk ${isDeactivating ? 'deactivating' : 'reactivating'} users:`, usersToProcess);
      
      const endpoint = isDeactivating ? ENDPOINTS.BULK_DEACTIVATE : ENDPOINTS.BULK_REACTIVATE;
      const url = buildUrl(endpoint);
      
      const payload = { userIds };
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${FIREBASE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Bulk ${isDeactivating ? 'deactivate' : 'reactivate'} response:`, result);

      // Update the users in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          userIds.includes(user.id.toString())
            ? { ...user, status: isDeactivating ? 'Inactive' : 'Active' }
            : user
        )
      );

      // Clear selection after successful operation
    setSelectedUsers([]);

      // Show success message
      const action = isDeactivating ? 'deactivated' : 'reactivated';
      alert(`Successfully ${action} ${usersToProcess.length} user account${usersToProcess.length > 1 ? 's' : ''}`);

      // Force immediate re-render to update filter counts
      setCurrentPage(currentPage);

      // Refresh user list to ensure status is up to date
      setTimeout(() => {
        fetchUsers();
      }, 1000);

    } catch (error) {
      console.error(`Error bulk ${isDeactivating ? 'deactivating' : 'reactivating'} users:`, error);
      alert(`Failed to ${isDeactivating ? 'deactivate' : 'reactivate'} user accounts. Please try again.`);
    }
  };



  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-description">Manage users and their permissions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Security Alerts Badge */}
          <Button variant="outline" className="header-button">
            <IconComponent name="Shield" className="icon-small mr-2" />
            Security Alerts
            {stats.criticalCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {stats.criticalCount}
              </Badge>
            )}
          </Button>
          <Button onClick={handleShowEmailLogs} className="header-button outline-button">
            <IconComponent name="Mail" className="icon-small mr-2" />
            Email Logs
          </Button>
          <Button onClick={openAddEmployeeModal} className="header-button outline-button">
            <IconComponent name="UserPlus" className="icon-small mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="user-management-layout">
        {/* Sidebar */}
        <div className="user-management-sidebar">
          <div className="search-container">
            <IconComponent name="Search" className="search-icon" />
            <Input
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Quick Filters Card */}
          <Card className="sidebar-card">
            <CardHeader className="card-header-compact">
              <CardTitle className="card-title-small">Quick Filters</CardTitle>
            </CardHeader>
            <CardContent className="card-content-compact">
              <button
                className={`filter-button ${activeFilter === "administrators" ? "filter-active" : ""}`}
                onClick={() => setActiveFilter("administrators")}
              >
                Administrators ({adminCount})
              </button>
              <button
                className={`filter-button ${activeFilter === "managers" ? "filter-active" : ""}`}
                onClick={() => setActiveFilter("managers")}
              >
                Managers ({managerCount})
              </button>
              <button
                className={`filter-button ${activeFilter === "employees" ? "filter-active" : ""}`}
                onClick={() => setActiveFilter("employees")}
              >
                Employees ({employeeCount})
              </button>
              
              <hr className="divider" />
              
              <button
                className={`filter-button ${activeFilter === "active" ? "filter-active" : ""}`}
                onClick={() => setActiveFilter("active")}
              >
                Active ({activeCount})
              </button>
              <button
                className={`filter-button ${activeFilter === "inactive" ? "filter-active" : ""}`}
                onClick={() => setActiveFilter("inactive")}
              >
                Inactive ({inactiveCount})
              </button>
              
              <hr className="divider" />
              
              <button
                className={`filter-button ${activeFilter === "all" ? "filter-active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Users ({departmentFilteredUsers.length})
              </button>
            </CardContent>
          </Card>
          
          {/* Department Filter Card */}
          <Card className="sidebar-card">
            <CardHeader className="card-header-compact">
              <CardTitle className="card-title-small">Departments</CardTitle>
            </CardHeader>
            <CardContent className="card-content-compact">
              <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value)}>
                <SelectTrigger className="department-select">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {/* Bulk Actions Card */}
          <Card className="sidebar-card">
            <CardHeader className="card-header-compact">
              <CardTitle className="card-title-small">Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent className="card-content-compact">
              <Button 
                variant="outline" 
                className="action-button"
                disabled={selectedUsers.length === 0}
                onClick={handleBulkSendEmail}
              >
                <IconComponent name="Mail" className="icon-small mr-2" />
                Send Email
              </Button>
              <Button 
                variant="outline" 
                className="action-button action-destructive"
                disabled={selectedUsers.length === 0}
                onClick={handleBulkDeactivate}
              >
                <IconComponent name="UserX" className="icon-small mr-2" />
                Deactivate/Reactivate
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="user-management-content">
          {/* User Accounts Card */}
          <Card className="content-card">
            <CardHeader className="card-header">
              <div className="card-header-content">
                <CardTitle>
                  User Accounts 
                  {activeFilter !== "all" && ` - ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
                  {selectedDepartment !== "all" && ` - ${selectedDepartment}`}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="card-content">
              {loading ? (
                <div className="loading-state">Loading users...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (
                <div className="users-table-scrollable">
                  <div className="table-header">
                    <div className="select-all">
                      <label className="custom-checkbox">
                        <input 
                          type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
                            }
                          }}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    <div>
                      <label className="select-label">
                        {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : "Select all"}
                      </label>
                    </div>
                    <div>Status</div>
                    <div>Role & Department</div>
                    <div></div> {/* Actions column */}
                  </div>
                  
                  <div className="table-body-scrollable">
                    {filteredUsers.map((user, index) => (
                      <div key={`${user.id}-${index}`} className="table-row">
                        <div className="user-info">
                          <label className="custom-checkbox">
                            <input 
                              type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                          />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                        
                          <div className="user-details">
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                        </div>
                        
                          <div className="user-status">
                          <div className={`status-badge status-${user.status.toLowerCase()}`}>
                            {user.status}
                          </div>
                            {user.lastActive && user.lastActive.toLowerCase() !== 'never' && (
                            <div className="last-active">
                              <IconComponent name="Clock" className="icon-tiny mr-1" />
                              {user.lastActive}
                            </div>
                            )}
                          </div>
                          
                          <div className="user-role">
                            <div className="role-title">{user.role}</div>
                            <div className="department">{user.department}</div>
                          </div>
                          
                        <div className="actions-column">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="icon-button">
                                <IconComponent name="MoreVertical" className="icon-small" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dropdown-menu-content">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                                <IconComponent name="Eye" className="icon-small mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem title="Coming soon - Role and permission management">
                                <IconComponent name="Shield" className="icon-small mr-2" />
                                Edit Permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(user)}>
                                <IconComponent name="Mail" className="icon-small mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                <IconComponent name="RefreshCw" className="icon-small mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className={user.status === 'Active' ? "dropdown-destructive" : ""}
                                onClick={() => user.status === 'Active' ? handleDeactivateUser(user) : handleReactivateUser(user)}
                              >
                                <IconComponent name={user.status === 'Active' ? "UserX" : "UserCheck"} className="icon-small mr-2" />
                                {user.status === 'Active' ? 'Deactivate Account' : 'Reactivate Account'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    
                    {filteredUsers.length === 0 && (
                      <div className="no-results">
                        <p>No users found. Try adjusting your search or filter.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Security Alerts Card */}
          <Card className="content-card">
            <CardHeader className="card-header">
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Real-time security monitoring</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <SecurityAlerts />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="dialog-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <Input id="firstName" placeholder="First name" />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <Input id="lastName" placeholder="Last name" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <Input id="email" placeholder="Email address" type="email" />
            </div>
            <div className="form-group">
              <label htmlFor="role" className="form-label">Role</label>
              <select id="role" className="select-input">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="department" className="form-label">Department</label>
              <select id="department" className="select-input">
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="checkbox-group">
              <Checkbox id="sendInvite" />
              <label htmlFor="sendInvite" className="checkbox-label">
                Send invitation email
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsAddUserOpen(false)}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate/Reactivate User Modal - Using business cards modal style */}
      {isDeactivateModalOpen && userToDeactivate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', width: '90vw' }}>
            <div className="modal-header">
              <h2>{userToDeactivate.status === 'Active' ? 'Deactivate' : 'Reactivate'} User Account</h2>
              <button 
                className="modal-close" 
                onClick={closeDeactivateModal}
                disabled={deactivateLoading}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: userToDeactivate.status === 'Active' ? '#fee2e2' : '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <IconComponent 
                    name={userToDeactivate.status === 'Active' ? "UserX" : "UserCheck"} 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      color: userToDeactivate.status === 'Active' ? '#dc2626' : '#16a34a' 
                    }} 
                  />
                </div>
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {userToDeactivate.status === 'Active' ? 'Deactivate' : 'Reactivate'} Account
                </h3>
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  {userToDeactivate.status === 'Active' 
                    ? 'Are you sure you want to deactivate this user account?' 
                    : 'Are you sure you want to reactivate this user account?'
                  }
                </p>
              </div>

              {userToDeactivate && (
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {userToDeactivate.name}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    {userToDeactivate.email}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280'
                  }}>
                    {userToDeactivate.role} • {userToDeactivate.department}
                  </div>
                </div>
              )}

              <div style={{
                background: userToDeactivate.status === 'Active' ? '#fef3cd' : '#eff6ff',
                border: `1px solid ${userToDeactivate.status === 'Active' ? '#f59e0b' : '#3b82f6'}`,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <IconComponent 
                    name={userToDeactivate.status === 'Active' ? "AlertTriangle" : "Shield"} 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      color: userToDeactivate.status === 'Active' ? '#d97706' : '#3b82f6',
                      marginTop: '2px',
                      flexShrink: 0
                    }} 
                  />
                  <div>
                    <div style={{
                      fontWeight: '500',
                      color: userToDeactivate.status === 'Active' ? '#92400e' : '#1e40af',
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem'
                    }}>
                      {userToDeactivate.status === 'Active' ? 'Warning' : 'Information'}
                    </div>
                    <div style={{
                      color: userToDeactivate.status === 'Active' ? '#92400e' : '#1e40af',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      {userToDeactivate.status === 'Active' 
                        ? 'This action will immediately deactivate the user\'s account. They will no longer be able to access the system.'
                        : 'This action will reactivate the user\'s account. They will regain access to the system immediately.'
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <Button 
                  variant="outline" 
                  onClick={closeDeactivateModal}
                  disabled={deactivateLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDeactivateUser}
                  disabled={deactivateLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: userToDeactivate.status === 'Active' ? '#dc2626' : '#16a34a',
                    borderColor: userToDeactivate.status === 'Active' ? '#dc2626' : '#16a34a',
                    color: 'white'
                  }}
                >
                  {deactivateLoading ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      {userToDeactivate.status === 'Active' ? 'Deactivating...' : 'Reactivating...'}
                    </div>
                  ) : (
                    `${userToDeactivate.status === 'Active' ? 'Deactivate' : 'Reactivate'} Account`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', width: '90vw' }}>
            <div className="modal-header">
              <h2>Reset User Password</h2>
              <button 
                className="modal-close" 
                onClick={closeResetPasswordModal}
                disabled={resetPasswordLoading}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <IconComponent 
                    name="RefreshCw" 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      color: '#3b82f6' 
                    }} 
                  />
                </div>
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  Reset Password
                </h3>
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  Send a password reset link to this user's email address
                </p>
              </div>

              {userToResetPassword && (
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {userToResetPassword.name}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    {userToResetPassword.email}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280'
                  }}>
                    {userToResetPassword.role} • {userToResetPassword.department}
                  </div>
                </div>
              )}

              <div style={{
                background: '#eff6ff',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <IconComponent 
                    name="Mail" 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      color: '#3b82f6',
                      marginTop: '2px',
                      flexShrink: 0
                    }} 
                  />
                  <div>
                    <div style={{
                      fontWeight: '500',
                      color: '#1e40af',
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem'
                    }}>
                      Password Reset Email
                    </div>
                    <div style={{
                      color: '#1e40af',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      A secure password reset link will be sent to the user's email address. 
                      The link will expire after a certain time for security.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <Button 
                  variant="outline" 
                  onClick={closeResetPasswordModal}
                  disabled={resetPasswordLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmResetPassword}
                  disabled={resetPasswordLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#3b82f6',
                    borderColor: '#3b82f6',
                    color: 'white'
                  }}
                >
                  {resetPasswordLoading ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {isSendEmailModalOpen && <SendEmailModal user={userToEmail} users={users} onClose={closeSendEmailModal} />}

      {/* Email Logs Modal */}
      {showEmailLogs && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', width: '95vw', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h2>Email Audit Trail</h2>
              <button className="modal-close" onClick={closeEmailLogs} aria-label="Close">
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
              {loadingLogs ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f3f4f6',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                  }}></div>
                  <p>Loading email logs...</p>
                </div>
              ) : emailLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <IconComponent name="Mail" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                  <h3>No Email Logs</h3>
                  <p>No emails have been sent yet. Send your first email to see the audit trail.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {emailLogs.map((log, index) => (
                    <div
                      key={log.id || index}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1rem',
                        background: 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '1rem', color: '#111827' }}>
                            {log.subject}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            From: {log.senderName} ({log.senderEmail})
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: log.status === 'sent' ? '#dcfce7' : '#fef3c7',
                            color: log.status === 'sent' ? '#166534' : '#92400e'
                          }}>
                            {log.status}
                          </span>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: log.priority === 'high' ? '#fef2f2' : log.priority === 'low' ? '#f0f9ff' : '#f0fdf4',
                            color: log.priority === 'high' ? '#dc2626' : log.priority === 'low' ? '#0ea5e9' : '#16a34a'
                          }}>
                            {log.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                        <div><strong>To:</strong> {log.recipients.join(', ')}</div>
                        {log.ccRecipients && log.ccRecipients.length > 0 && (
                          <div><strong>CC:</strong> {log.ccRecipients.join(', ')}</div>
                        )}
                        {log.bccRecipientCount > 0 && (
                          <div><strong>BCC:</strong> {log.bccRecipientCount} recipient(s)</div>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {log.bodyPreview}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
                        <div>
                          {log.attachmentCount > 0 && (
                            <span style={{ marginRight: '1rem' }}>
                              📎 {log.attachmentCount} attachment(s)
                            </span>
                          )}
                          <span>
                            📅 {new Date(log.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          {log.accepted && log.accepted.length > 0 && (
                            <span style={{ marginRight: '1rem', color: '#16a34a' }}>
                              ✓ {log.accepted.length} accepted
                            </span>
                          )}
                          {log.rejected && log.rejected.length > 0 && (
                            <span style={{ color: '#dc2626' }}>
                              ✗ {log.rejected.length} rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {isViewProfileModalOpen && (
        <ViewProfileModal user={userToViewProfile} onClose={closeViewProfileModal} />
      )}
    </div>
  );
};

export default UserManagement;

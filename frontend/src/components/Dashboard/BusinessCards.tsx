import { useState, useEffect, useRef } from "react";
import { FaSearch, FaQrcode, FaShare, FaEdit, FaTimes, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaSnapchat, FaWhatsapp, FaTelegram, FaDiscord, FaSkype, FaGithub, FaPinterest, FaTwitch, FaSpotify, FaSoundcloud, FaBehance, FaDribbble, FaMedium, FaReddit, FaTumblr, FaVimeo, FaUpload, FaPalette, FaEnvelope, FaPhone } from "react-icons/fa";
import { Button } from "../UI/button";
import "../../styles/BusinessCards.css";
import "../../styles/Dashboard.css";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, buildUrl, FIREBASE_TOKEN, API_BASE_URL } from "../../utils/api";
import { useUserContext } from "../../hooks/useUserContext";
import { useUser } from "../../contexts/UserContext";

// Update the CardData interface to include only the fields we need
interface CardData {
  id?: string;
  name: string;
  surname: string;
  occupation: string;
  email: string;
  phone: string;
  colorScheme: string;
  numberOfScan?: number;
  departmentName?: string;
  employeeTitle?: string;
  company?: string;
  // Image fields that already exist in the backend
  profileImage?: string | null;
  companyLogo?: string | null;
  // Additional fields that might exist
  cardImage?: string | null;
  // Social media fields - support both old string format and new object format
  linkedin?: string | { link: string; title: string };
  twitter?: string | { link: string; title: string };
  facebook?: string | { link: string; title: string };
  instagram?: string | { link: string; title: string };
  youtube?: string | { link: string; title: string };
  tiktok?: string | { link: string; title: string };
  snapchat?: string | { link: string; title: string };
  whatsapp?: string | { link: string; title: string };
  telegram?: string | { link: string; title: string };
  discord?: string | { link: string; title: string };
  skype?: string | { link: string; title: string };
  github?: string | { link: string; title: string };
  pinterest?: string | { link: string; title: string };
  twitch?: string | { link: string; title: string };
  spotify?: string | { link: string; title: string };
  soundcloud?: string | { link: string; title: string };
  behance?: string | { link: string; title: string };
  dribbble?: string | { link: string; title: string };
  medium?: string | { link: string; title: string };
  reddit?: string | { link: string; title: string };
  tumblr?: string | { link: string; title: string };
  vimeo?: string | { link: string; title: string };
  // QR code field
  qrCodeUrl?: string;
  // Social media fields - new structure from backend
  socials?: { [key: string]: { link: string; title: string } };
}

// Add this function to determine card colors based on department
const getCardColor = (colorScheme: string): string => {
  return colorScheme || '#4361ee'; // Default to blue if colorScheme not found
};

// Social platforms array - moved outside components for reuse
const socialPlatforms = [
  { key: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, placeholder: 'LinkedIn profile URL' },
  { key: 'twitter', name: 'Twitter', icon: FaTwitter, placeholder: 'Twitter handle' },
  { key: 'facebook', name: 'Facebook', icon: FaFacebook, placeholder: 'Facebook profile URL' },
  { key: 'instagram', name: 'Instagram', icon: FaInstagram, placeholder: 'Instagram handle' },
  { key: 'youtube', name: 'YouTube', icon: FaYoutube, placeholder: 'YouTube channel URL' },
  { key: 'tiktok', name: 'TikTok', icon: FaTiktok, placeholder: 'TikTok username' },
  { key: 'snapchat', name: 'Snapchat', icon: FaSnapchat, placeholder: 'Snapchat username' },
  { key: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, placeholder: 'WhatsApp number' },
  { key: 'telegram', name: 'Telegram', icon: FaTelegram, placeholder: 'Telegram username' },
  { key: 'discord', name: 'Discord', icon: FaDiscord, placeholder: 'Discord username' },
  { key: 'skype', name: 'Skype', icon: FaSkype, placeholder: 'Skype username' },
  { key: 'github', name: 'GitHub', icon: FaGithub, placeholder: 'GitHub profile URL' },
  { key: 'pinterest', name: 'Pinterest', icon: FaPinterest, placeholder: 'Pinterest profile URL' },
  { key: 'twitch', name: 'Twitch', icon: FaTwitch, placeholder: 'Twitch channel URL' },
  { key: 'spotify', name: 'Spotify', icon: FaSpotify, placeholder: 'Spotify profile URL' },
  { key: 'soundcloud', name: 'SoundCloud', icon: FaSoundcloud, placeholder: 'SoundCloud profile URL' },
  { key: 'behance', name: 'Behance', icon: FaBehance, placeholder: 'Behance profile URL' },
  { key: 'dribbble', name: 'Dribbble', icon: FaDribbble, placeholder: 'Dribbble profile URL' },
  { key: 'medium', name: 'Medium', icon: FaMedium, placeholder: 'Medium profile URL' },
  { key: 'reddit', name: 'Reddit', icon: FaReddit, placeholder: 'Reddit profile URL' },
  { key: 'tumblr', name: 'Tumblr', icon: FaTumblr, placeholder: 'Tumblr blog URL' },
  { key: 'vimeo', name: 'Vimeo', icon: FaVimeo, placeholder: 'Vimeo profile URL' }
];

// Social Modal Component
const SocialModal = ({ 
  platform, 
  isOpen, 
  onClose, 
  onSave, 
  currentData 
}: { 
  platform: typeof socialPlatforms[0]; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: { link: string; title: string }) => void;
  currentData?: { link: string; title: string };
}) => {
  const [link, setLink] = useState(currentData?.link || '');
  const [title, setTitle] = useState(currentData?.title || '');

  const handleSave = () => {
    if (link.trim() && title.trim()) {
      onSave({ link: link.trim(), title: title.trim() });
      onClose();
    }
  };

  const handleRemove = () => {
    onSave({ link: '', title: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content social-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add {platform.name}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label>Link/Handle</label>
            <input
              type="text"
              placeholder={platform.placeholder}
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Display Title</label>
            <input
              type="text"
              placeholder={`e.g., ${platform.name} Profile`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-actions">
          {currentData?.link && (
            <Button variant="outline" onClick={handleRemove}>
              Remove
            </Button>
          )}
          <Button onClick={handleSave}>Set</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

// Function to fetch cards based on user type
const fetchCardsByUserType = async (isEnterprise: boolean, enterpriseId?: string, userId?: string): Promise<CardData[]> => {
  if (isEnterprise) {
    // Enterprise user - fetch enterprise cards
    const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_CARDS, enterpriseId);
    const headers = getEnterpriseHeaders();
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Enterprise cards fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return processCardsData(responseData);
  } else {
    // Individual user - fetch user's own cards
    const url = buildUrl(`${ENDPOINTS.GET_CARD}/${userId}`);
    
    // TODO: When login page is implemented, get token from localStorage
    // For now, use the hardcoded Firebase token from api.ts
    const token = FIREBASE_TOKEN;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('Fetching individual cards with URL:', url); // Debug log
    console.log('Using headers for cards:', headers); // Debug log
    
    const response = await fetch(url, { headers });
    
    console.log('Cards API response status:', response.status); // Debug log
    
    if (!response.ok) {
      throw new Error(`Individual cards fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return processCardsData(responseData);
  }
};

// Helper function to process cards data consistently
const processCardsData = (responseData: any): CardData[] => {
  let cardsData: CardData[] = [];
  
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
  
  // Add IDs if they don't exist and normalize data
  return cardsData.map((card, index) => ({
    ...card,
    id: card.id || `${index + 1}`,
    numberOfScan: card.numberOfScan || 0,
    departmentName: card.departmentName || 'N/A',
    employeeTitle: card.employeeTitle || card.occupation || 'N/A'
  }));
};

const BusinessCardItem = ({ 
  card, 
  isPreview = false, 
  onQRClick, 
  onShareClick, 
  onEditClick 
}: { 
  card: CardData; 
  isPreview?: boolean;
  onQRClick?: () => void;
  onShareClick?: () => void;
  onEditClick?: () => void;
}) => {
  return (
    <div key={card.id} className={`business-card ${isPreview ? 'preview-card' : ''}`}>
      <div className="business-card-content">
        <div className={`business-card-left ${!card.companyLogo && !card.profileImage ? 'no-images' : ''}`} 
             style={{ backgroundColor: !card.companyLogo && !card.profileImage ? getCardColor(card.colorScheme) : 'transparent' }}>
          {card.companyLogo ? (
            <div className="company-logo-full">
              <img src={card.companyLogo} alt="Company Logo" />
              {card.profileImage && (
                <div className="profile-image-overlay">
                  <img src={card.profileImage} alt="Profile" />
                </div>
              )}
              {/* {!isPreview && (
                <div className="send-link-overlay">
                  <button 
                    className="send-link-btn"
                    onClick={() => onShareClick?.()}
                    title="Send link"
                  >
                    Send link
                  </button>
                </div>
              )} */}
            </div>
          ) : card.profileImage ? (
            <div className="profile-image-full">
              <img src={card.profileImage} alt="Profile" />
              {!isPreview && (
                <div className="send-link-overlay">
                  <button 
                    className="send-link-btn"
                    onClick={() => onShareClick?.()}
                    title="Send link"
                  >
                    Send link
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="xscard-logo">
              <span>XS</span>
            </div>
          )}
        </div>
        
        <div className="business-card-right">
          <div className="business-card-info">
            <h3 className="business-card-name">{card.name} {card.surname}</h3>
            <p className="business-card-title">{card.occupation || card.employeeTitle || 'N/A'}</p>
            {card.company && (
              <p className="business-card-company">{card.company}</p>
            )}
            {card.departmentName && card.departmentName !== 'N/A' && (
              <p className="business-card-department">{card.departmentName}</p>
            )}
          </div>
          
          <div className="business-card-contact-info">
            <div className="contact-item">
              <div 
                className="contact-icon" 
                style={{ 
                  borderColor: getCardColor(card.colorScheme),
                  color: getCardColor(card.colorScheme)
                }}
                onClick={() => window.open(`mailto:${card.email}`, '_blank')}
                title={`Email ${card.email}`}
              >
                <FaEnvelope />
              </div>
              <span className="contact-text">{card.email}</span>
            </div>
            <div className="contact-item">
              <div 
                className="contact-icon" 
                style={{ 
                  borderColor: getCardColor(card.colorScheme),
                  color: getCardColor(card.colorScheme)
                }}
                onClick={() => window.open(`tel:${card.phone}`, '_blank')}
                title={`Call ${card.phone}`}
              >
                <FaPhone />
              </div>
              <span className="contact-text">{card.phone}</span>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="business-card-socials">
            {socialPlatforms.map(platform => {
              const IconComponent = platform.icon;
              const socials = card.socials as { [key: string]: { link: string; title: string } } | undefined;
              const socialData = socials?.[platform.key];
              
              if (socialData && socialData.link && socialData.title) {
                return (
                  <div key={platform.key} className="social-item">
                    <div 
                      className="social-icon" 
                      style={{ 
                        borderColor: getCardColor(card.colorScheme),
                        color: getCardColor(card.colorScheme)
                      }}
                      onClick={() => window.open(socialData.link, '_blank')}
                      title={`Open ${socialData.title}`}
                    >
                      <IconComponent />
                    </div>
                    <span className="social-title">{socialData.title}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
          
          <div className="business-card-footer">
            <span className="business-card-scans">{card.numberOfScan || 0} scans</span>
            <div className="business-card-actions">
              <button 
                className="action-button" 
                title="QR Code"
                onClick={() => !isPreview && onQRClick?.()}
              >
                <FaQrcode />
              </button>
              <button 
                className="action-button" 
                title="Share"
                onClick={() => !isPreview && onShareClick?.()}
              >
                <FaShare />
              </button>
              <button 
                className="action-button" 
                title="Edit"
                onClick={() => !isPreview && onEditClick?.()}
              >
                <FaEdit />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// QR Code Modal Component
const QRCodeModal = ({ card, cardIndex, userId, isOpen, onClose }: { 
  card: CardData; 
  cardIndex: number;
  userId: string;
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchQRCode = async () => {
        setLoading(true);
        setError(null);
        try {
          const endpoint = `${API_BASE_URL}/generateQR/${userId}/${cardIndex}`;
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${FIREBASE_TOKEN}`
            }
          });
          if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
          }
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setQrCodeUrl(blobUrl);
        } catch (err) {
          setError('Failed to generate QR code');
          console.error('QR Code generation error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchQRCode();
    }
  }, [isOpen, userId, cardIndex]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${API_BASE_URL}/card/${userId}/${cardIndex}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${card.name}-${card.surname}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay qr-modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        {/* Card-themed header */}
        <div 
          className="qr-modal-header" 
          style={{ backgroundColor: getCardColor(card.colorScheme) }}
        >
          <div className="qr-modal-user-info">
            <div className="qr-modal-avatar" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {card.profileImage ? (
                <img src={card.profileImage} alt="Profile" />
              ) : (
                <span>{card.name[0]}{card.surname[0]}</span>
              )}
            </div>
            <div className="qr-modal-user-details">
              <h2>Scan {card.name} {card.surname}'s card</h2>
              <p>Point any camera at this code to view the digital business card</p>
            </div>
          </div>
          <button className="modal-close qr-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="qr-modal-body">
          <div className="qr-code-container">
            {loading ? (
              <div className="qr-placeholder">
                <div className="qr-loading-spinner"></div>
                <p>Generating QR Code...</p>
              </div>
            ) : error ? (
              <div className="qr-placeholder qr-error">
                <FaQrcode size={60} />
                <p>{error}</p>
                <button className="retry-button" onClick={() => window.location.reload()}>
                  Try Again
                </button>
              </div>
            ) : qrCodeUrl ? (
              <div className="qr-code-wrapper">
                <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
              </div>
            ) : (
              <div className="qr-placeholder">
                <FaQrcode size={60} />
                <p>QR Code not available</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="qr-modal-actions">
            <button 
              className={`qr-action-button ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              disabled={!qrCodeUrl}
            >
              {copied ? '✓ Copied' : 'Copy Link'}
            </button>
            <button 
              className="qr-action-button"
              onClick={handleDownload}
              disabled={!qrCodeUrl}
            >
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Card Modal Component
const CreateCardModal = ({ userContext, isOpen, onClose, onSave }: { 
  userContext: any;
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (newCard: CardData) => void;
}) => {
  const [newCard, setNewCard] = useState<Partial<CardData>>({
    name: '',
    surname: '',
    occupation: '',
    company: '',
    email: '',
    phone: '',
    colorScheme: '#1B2B5B',
    profileImage: null,
    companyLogo: null
  });
  const [selectedTheme, setSelectedTheme] = useState('#1B2B5B');
  const [customColor, setCustomColor] = useState('#1B2B5B');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeSocialModal, setActiveSocialModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const companyLogoRef = useRef<HTMLInputElement>(null);

  const themes = [
    '#1B2B5B', // Navy Blue
    '#E63946', // Red
    '#2A9D8F', // Teal
    '#E9C46A', // Yellow
    '#F4A261', // Orange
    '#6D597A', // Purple
    '#355070', // Dark Blue
    '#B56576', // Pink
    '#4DAA57', // Green
    '#264653', // Dark Teal
    '#FF4B6E'  // Pinkish red
  ];

  useEffect(() => {
    setNewCard(prev => ({ ...prev, colorScheme: selectedTheme }));
  }, [selectedTheme]);

  const handleInputChange = (field: keyof CardData, value: string) => {
    setNewCard(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platformKey: string, data: { link: string; title: string }) => {
    setNewCard(prev => {
      const currentSocials = prev.socials || {};
      const newSocials = { ...currentSocials };
      
      if (data.link && data.title) {
        newSocials[platformKey] = data;
      } else {
        delete newSocials[platformKey];
      }
      
      return {
        ...prev,
        socials: newSocials
      };
    });
  };

  const handleImageUpload = (field: 'profileImage' | 'companyLogo', file: File) => {
    // For preview, convert to Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setNewCard(prev => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: 'profileImage' | 'companyLogo') => {
    setNewCard(prev => ({ ...prev, [field]: null }));
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!newCard.company?.trim() || !newCard.email?.trim() || !newCard.phone?.trim() || !newCard.occupation?.trim()) {
      alert('❌ Please fill in all required fields: Company, Email, Phone, and Job Title');
      return;
    }

    try {
      setLoading(true);

      // Get the actual file objects from the file inputs
      const profileFile = profileImageRef.current?.files?.[0];
      const companyFile = companyLogoRef.current?.files?.[0];

      // Prepare social media data
      const cardSocials = newCard.socials as { [key: string]: { link: string; title: string } } | undefined;
      const socialsObject: { [key: string]: { link: string; title: string } } = {};
      
      socialPlatforms.forEach(platform => {
        const socialData = cardSocials?.[platform.key];
        if (socialData && socialData.link && socialData.title) {
          socialsObject[platform.key] = {
            link: socialData.link,
            title: socialData.title
          };
        }
      });

      // Create FormData with all card data and images
      const formData = new FormData();
      formData.append('company', newCard.company?.trim() || '');
      formData.append('email', newCard.email?.trim() || '');
      formData.append('phone', newCard.phone?.trim() || '');
      formData.append('title', newCard.occupation?.trim() || ''); // API expects 'title', we send 'occupation'
      formData.append('name', newCard.name?.trim() || '');
      formData.append('surname', newCard.surname?.trim() || '');
      formData.append('colorScheme', newCard.colorScheme || '#1B2B5B');
      formData.append('socials', JSON.stringify(socialsObject));

      // Add images if they exist
      if (profileFile) {
        formData.append('profileImage', profileFile);
      }
      if (companyFile) {
        formData.append('companyLogo', companyFile);
      }

      console.log('🆕 Creating card with FormData:', {
        company: newCard.company?.trim(),
        email: newCard.email?.trim(),
        phone: newCard.phone?.trim(),
        title: newCard.occupation?.trim(),
        name: newCard.name?.trim() || '',
        surname: newCard.surname?.trim() || '',
        colorScheme: newCard.colorScheme || '#1B2B5B',
        socials: socialsObject,
        hasProfileImage: !!profileFile,
        hasCompanyLogo: !!companyFile
      });

      const endpoint = buildUrl(ENDPOINTS.ADD_CARD);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIREBASE_TOKEN}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🆕 Create card failed:', response.status, response.statusText, errorText);
        throw new Error(`Failed to create card: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ Card created successfully:', responseData);

      // Create the new card object for local state
      const createdCard: CardData = {
        id: responseData.cardData?.id || Date.now().toString(),
        name: responseData.cardData?.name || '',
        surname: responseData.cardData?.surname || '',
        occupation: responseData.cardData?.occupation || '',
        company: responseData.cardData?.company || '',
        email: responseData.cardData?.email || '',
        phone: responseData.cardData?.phone || '',
        colorScheme: responseData.cardData?.colorScheme || '#1B2B5B',
        profileImage: responseData.cardData?.profileImage || null,
        companyLogo: responseData.cardData?.companyLogo || null,
        numberOfScan: 0,
        departmentName: 'N/A',
        employeeTitle: responseData.cardData?.occupation || ''
      };

      // Add social media fields if they exist in the response
      if (responseData.cardData?.socials) {
        createdCard.socials = responseData.cardData.socials;
      }

      onSave(createdCard);
      onClose();
      
      // Reset form
      setNewCard({
        name: '',
        surname: '',
        occupation: '',
        company: '',
        email: '',
        phone: '',
        colorScheme: '#1B2B5B',
        profileImage: null,
        companyLogo: null
      });
      setSelectedTheme('#1B2B5B');
      
      // Show success message
      alert('✅ Card created successfully!');
    } catch (error) {
      console.error('Error creating card:', error);
      
      // Show specific error messages
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          alert('❌ Unauthorized: You do not have permission to create cards.');
        } else if (error.message.includes('400')) {
          alert('❌ Invalid data: Please check your card information.');
        } else {
          alert(`❌ Failed to create card: ${error.message}`);
        }
      } else {
        alert('❌ Failed to create card. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-content">
          {/* Left side - Form */}
          <div className="edit-form-section">
            <div className="modal-header">
              <h2>Create New Card</h2>
              <button className="modal-close" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            {/* Image Uploads */}
            <div className="form-section">
              <h3>Add Images</h3>
              <div className="image-uploads">
                <div className="image-upload-item">
                  <div 
                    className="image-upload-preview clickable"
                    onClick={() => profileImageRef.current?.click()}
                  >
                    {newCard.profileImage ? (
                      <img src={newCard.profileImage} alt="Profile" />
                    ) : (
                      <div className="image-placeholder">
                        <FaUpload />
                        <span>Profile Picture</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={profileImageRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('profileImage', file);
                    }}
                  />
                  {newCard.profileImage && (
                    <button 
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage('profileImage')}
                      title="Remove profile picture"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="image-upload-item">
                  <div 
                    className="image-upload-preview clickable"
                    onClick={() => companyLogoRef.current?.click()}
                  >
                    {newCard.companyLogo ? (
                      <img src={newCard.companyLogo} alt="Company Logo" />
                    ) : (
                      <div className="image-placeholder">
                        <FaUpload />
                        <span>Company Logo</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={companyLogoRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('companyLogo', file);
                    }}
                  />
                  {newCard.companyLogo && (
                    <button 
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage('companyLogo')}
                      title="Remove company logo"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="form-section">
              <h3>Choose a theme</h3>
              <div className="theme-selection">
                <div className="theme-colors">
                  {themes.map(color => (
                    <button
                      key={color}
                      className={`theme-color ${selectedTheme === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedTheme(color)}
                    />
                  ))}
                </div>
                <div className="color-picker-section">
                  <button
                    className="color-picker-btn"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <FaPalette />
                    Custom Color
                  </button>
                  {showColorPicker && (
                    <div className="color-picker-container">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setSelectedTheme(e.target.value);
                        }}
                        className="color-picker-input"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setSelectedTheme(e.target.value);
                        }}
                        placeholder="#FFFFFF"
                        className="hex-input"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Fields */}
            <div className="form-section">
              <h3>Personal</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Name (Optional)</label>
                  <input
                    type="text"
                    value={newCard.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div className="form-field">
                  <label>Surname (Optional)</label>
                  <input
                    type="text"
                    value={newCard.surname || ''}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                    placeholder="Enter surname"
                  />
                </div>
                <div className="form-field">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={newCard.occupation || ''}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    placeholder="Enter job title"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={newCard.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Fields */}
            <div className="form-section">
              <h3>Contact</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newCard.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={newCard.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="form-section">
              <h3>Social (Optional)</h3>
              <div className="social-grid">
                {socialPlatforms.map(platform => {
                  const IconComponent = platform.icon;
                  const socials = newCard.socials as { [key: string]: { link: string; title: string } } | undefined;
                  const socialData = socials?.[platform.key];
                  const isActive = socialData && socialData.link && socialData.title;
                  
                  return (
                    <div key={platform.key} className="social-grid-item">
                      <div 
                        className={`social-grid-button ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveSocialModal(platform.key)}
                      >
                        <div className="social-grid-icon">
                          <IconComponent />
                        </div>
                        <div className="social-grid-label">{platform.name}</div>
                        <div className="social-toggle-indicator">
                          {isActive ? '−' : '+'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions">
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create Card'}
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="edit-preview-section">
            <h3>Preview</h3>
            <BusinessCardItem card={newCard as CardData} isPreview={true} />
          </div>
        </div>
      </div>

      {/* Social Modal */}
      {activeSocialModal && (
        <SocialModal
          platform={socialPlatforms.find(p => p.key === activeSocialModal)!}
          isOpen={!!activeSocialModal}
          onClose={() => setActiveSocialModal(null)}
          onSave={(data) => {
            handleSocialChange(activeSocialModal, data);
            setActiveSocialModal(null);
          }}
          currentData={newCard.socials?.[activeSocialModal]}
        />
      )}
    </div>
  );
};

// Edit Card Modal Component
const EditCardModal = ({ card, cards, userContext, isOpen, onClose, onSave }: { 
  card: CardData; 
  cards: CardData[];
  userContext: any;
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (updatedCard: CardData) => void;
}) => {
  const [editedCard, setEditedCard] = useState<CardData>(card);
  const [selectedTheme, setSelectedTheme] = useState(card.colorScheme || '#4361ee');
  const [customColor, setCustomColor] = useState('#4361ee');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeSocialModal, setActiveSocialModal] = useState<string | null>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const companyLogoRef = useRef<HTMLInputElement>(null);

  const themes = [
    '#1B2B5B', // Navy Blue
    '#E63946', // Red
    '#2A9D8F', // Teal
    '#E9C46A', // Yellow
    '#F4A261', // Orange
    '#6D597A', // Purple
    '#355070', // Dark Blue
    '#B56576', // Pink
    '#4DAA57', // Green
    '#264653', // Dark Teal
    '#FF4B6E'  // Pinkish red
  ];



  useEffect(() => {
    setEditedCard(prev => ({ ...prev, colorScheme: selectedTheme }));
  }, [selectedTheme]);

  // Update editedCard when card prop changes (but preserve any unsaved changes)
  useEffect(() => {
    setEditedCard(card);
    setSelectedTheme(card.colorScheme || '#4361ee');
  }, [card]);

  const handleInputChange = (field: keyof CardData, value: string) => {
    setEditedCard(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platformKey: string, data: { link: string; title: string }) => {
    setEditedCard(prev => {
      const currentSocials = prev.socials || {};
      const newSocials = { ...currentSocials };
      
      if (data.link && data.title) {
        newSocials[platformKey] = data;
      } else {
        delete newSocials[platformKey];
      }
      
      return {
        ...prev,
        socials: newSocials
      };
    });
  };

  const handleImageUpload = (field: 'profileImage' | 'companyLogo', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEditedCard(prev => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      // Get the card index from the cards array
      const cardIndex = cards.findIndex(c => c.id === card.id);
      if (cardIndex === -1) {
        throw new Error('Card not found');
      }

      // Prepare social media data
      const cardSocials = editedCard.socials as { [key: string]: { link: string; title: string } } | undefined;
      const socialsObject: { [key: string]: { link: string; title: string } } = {};
      
      socialPlatforms.forEach(platform => {
        const socialData = cardSocials?.[platform.key];
        if (socialData && socialData.link && socialData.title) {
          socialsObject[platform.key] = {
            link: socialData.link,
            title: socialData.title
          };
        }
      });

      // Create request payload
      const payload = {
        ...editedCard,
        socials: socialsObject
      };

      // Use PATCH endpoint for updating the card
      const endpoint = `${API_BASE_URL}/Cards/${userContext.userId}?cardIndex=${cardIndex}`;
      console.log('💾 Saving card with endpoint:', endpoint);
      console.log('💾 Card data:', payload);

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIREBASE_TOKEN}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('💾 Save failed:', response.status, response.statusText, errorText);
        throw new Error(`Failed to save card: ${response.status} ${response.statusText}`);
      }

      const savedCard = await response.json();
      console.log('✅ Card saved successfully:', savedCard);

      // Update the local state with the saved card
      onSave(editedCard);
      onClose();
      
      // Show success message
      alert('✅ Card updated successfully!');
    } catch (error) {
      console.error('Error saving card:', error);
      
      // Show specific error messages
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          alert('❌ Unauthorized: You do not have permission to update this card.');
        } else if (error.message.includes('404')) {
          alert('❌ Card not found: The card may have been deleted or moved.');
        } else if (error.message.includes('400')) {
          alert('❌ Invalid data: Please check your card information.');
        } else {
          alert(`❌ Failed to save card: ${error.message}`);
        }
      } else {
        alert('❌ Failed to save card. Please try again.');
      }
    }
  };



  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-content">
          {/* Left side - Form */}
          <div className="edit-form-section">
            <div className="modal-header">
              <h2>Edit Card</h2>
              <button className="modal-close" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            {/* Image Uploads */}
            <div className="form-section">
              <h3>Add Images</h3>
              <div className="image-uploads">
                <div className="image-upload-item">
                  <div 
                    className="image-upload-preview clickable"
                    onClick={() => profileImageRef.current?.click()}
                  >
                    {editedCard.profileImage ? (
                      <img src={editedCard.profileImage} alt="Profile" />
                    ) : (
                      <div className="image-placeholder">
                        <FaUpload />
                        <span>Profile Picture</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={profileImageRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('profileImage', file);
                    }}
                  />
                </div>

                <div className="image-upload-item">
                  <div 
                    className="image-upload-preview clickable"
                    onClick={() => companyLogoRef.current?.click()}
                  >
                    {editedCard.companyLogo ? (
                      <img src={editedCard.companyLogo} alt="Company Logo" />
                    ) : (
                      <div className="image-placeholder">
                        <FaUpload />
                        <span>Company Logo</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={companyLogoRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload('companyLogo', file);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="form-section">
              <h3>Choose a theme</h3>
              <div className="theme-selection">
                <div className="theme-colors">
                  {themes.map(color => (
                    <button
                      key={color}
                      className={`theme-color ${selectedTheme === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedTheme(color)}
                    />
                  ))}
                </div>
                <div className="color-picker-section">
                  <button
                    className="color-picker-btn"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <FaPalette />
                    Custom Color
                  </button>
                  {showColorPicker && (
                    <div className="color-picker-container">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setSelectedTheme(e.target.value);
                        }}
                        className="color-picker-input"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setSelectedTheme(e.target.value);
                        }}
                        placeholder="#FFFFFF"
                        className="hex-input"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Fields */}
            <div className="form-section">
              <h3>Personal</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editedCard.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Surname</label>
                  <input
                    type="text"
                    value={editedCard.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={editedCard.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Company</label>
                  <input
                    type="text"
                    value={editedCard.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Department</label>
                  <input
                    type="text"
                    value={editedCard.departmentName || ''}
                    onChange={(e) => handleInputChange('departmentName', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Contact Fields */}
            <div className="form-section">
              <h3>Contact</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editedCard.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editedCard.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="form-section">
              <h3>Social</h3>
              <div className="social-grid">
                {socialPlatforms.map(platform => {
                  const IconComponent = platform.icon;
                  const socials = editedCard.socials as { [key: string]: { link: string; title: string } } | undefined;
                  const socialData = socials?.[platform.key];
                  const isActive = socialData && socialData.link && socialData.title;
                  
                  return (
                    <div key={platform.key} className="social-grid-item">
                      <div 
                        className={`social-grid-button ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveSocialModal(platform.key)}
                      >
                        <div className="social-grid-icon">
                          <IconComponent />
                        </div>
                        <div className="social-grid-label">{platform.name}</div>
                        <div className="social-toggle-indicator">
                          {isActive ? '−' : '+'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="edit-preview-section">
            <h3>Preview</h3>
            <BusinessCardItem card={editedCard} isPreview={true} />
          </div>
        </div>
      </div>

      {/* Social Modal */}
      {activeSocialModal && (
        <SocialModal
          platform={socialPlatforms.find(p => p.key === activeSocialModal)!}
          isOpen={!!activeSocialModal}
          onClose={() => setActiveSocialModal(null)}
          onSave={(data) => {
            handleSocialChange(activeSocialModal, data);
            setActiveSocialModal(null);
          }}
          currentData={editedCard.socials?.[activeSocialModal]}
        />
      )}
    </div>
  );
};

// Template Creation Modal Component
const CreateTemplateModal = ({ userContext, user, isOpen, onClose, onSave }: { 
  userContext: any;
  user: any;
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (newTemplate: any) => void;
}) => {
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    colorScheme: '#1B2B5B',
    companyLogo: null as string | null,
    departmentId: null as string | null,
    isEnterprise: user?.role === 'Administrator' || user?.role === 'Admin'
  });
  const [selectedTheme, setSelectedTheme] = useState('#1B2B5B');
  const [customColor, setCustomColor] = useState('#1B2B5B');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const companyLogoRef = useRef<HTMLInputElement>(null);

  const themes = [
    '#1B2B5B', // Navy Blue
    '#E63946', // Red
    '#2A9D8F', // Teal
    '#E9C46A', // Yellow
    '#F4A261', // Orange
    '#6D597A', // Purple
    '#355070', // Dark Blue
    '#B56576', // Pink
    '#4DAA57', // Green
    '#264653', // Dark Teal
    '#FF4B6E'  // Pinkish red
  ];

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  useEffect(() => {
    setTemplateData(prev => ({ ...prev, colorScheme: selectedTheme }));
  }, [selectedTheme]);

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const url = buildEnterpriseUrl(ENDPOINTS.ENTERPRISE_DEPARTMENTS);
      const headers = getEnterpriseHeaders();
      
      console.log('Departments URL:', url);
      console.log('Departments headers:', headers);
      
      const response = await fetch(url, { headers });
      
      console.log('Departments response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error for departments! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Departments response data:', data);
      
      if (!data.departments || !Array.isArray(data.departments)) {
        throw new Error('Invalid departments response format');
      }
      
      console.log('Setting departments:', data.departments);
      setDepartments(data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]); // Set empty array on error
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTemplateData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file: File) => {
    // For template creation, we'll store the file reference
    // The actual upload will happen during form submission
    setTemplateData(prev => ({ ...prev, companyLogo: URL.createObjectURL(file) }));
  };

  const handleRemoveImage = () => {
    setTemplateData(prev => ({ ...prev, companyLogo: null }));
  };

  const handleCreate = async () => {
    // Check if user context is loaded
    if (!userContext || userContext.isLoading) {
      alert('❌ Please wait for user context to load');
      return;
    }

    // Validate required fields
    if (!templateData.name.trim()) {
      alert('❌ Please enter a template name');
      return;
    }

    if (!templateData.colorScheme) {
      alert('❌ Please select a color scheme');
      return;
    }

    // Validate hex color format
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(templateData.colorScheme)) {
      alert('❌ Please enter a valid hex color (e.g., #FF5733)');
      return;
    }

    // Validate enterprise ID
    const enterpriseId = userContext.enterpriseId || localStorage.getItem('enterpriseId') || 'x-spark-test';
    
    if (!enterpriseId) {
      alert('❌ Enterprise ID is required');
      return;
    }

    // Validate department selection for department templates
    if (!templateData.isEnterprise && !templateData.departmentId) {
      alert('❌ Please select a department for department-specific templates');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('enterpriseId', enterpriseId);
      formData.append('departmentId', templateData.isEnterprise ? '' : (templateData.departmentId || ''));
      formData.append('name', templateData.name.trim());
      formData.append('description', templateData.description.trim());
      formData.append('colorScheme', templateData.colorScheme);

      // Add logo file if selected
      const logoFile = companyLogoRef.current?.files?.[0];
      if (logoFile) {
        formData.append('companyLogo', logoFile);
      }

      // Create template via API with multipart form data
      const templateUrl = buildUrl('/api/templates');
      
      const response = await fetch(templateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FIREBASE_TOKEN}`
          // Don't set Content-Type - let browser set it with boundary for multipart
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Try to parse as JSON for better error message
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`Failed to create template: ${errorJson.message || errorText}`);
        } catch (parseError) {
          throw new Error(`Failed to create template: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }
      
      const result = await response.json();

      if (result.success) {
        onSave(result.data);
        onClose();
        
        // Reset form
        setTemplateData({
          name: '',
          description: '',
          colorScheme: '#1B2B5B',
          companyLogo: null,
          departmentId: null,
          isEnterprise: user?.role === 'Administrator' || user?.role === 'Admin'
        });
        setSelectedTheme('#1B2B5B');
        
        // Clear file input
        if (companyLogoRef.current) {
          companyLogoRef.current.value = '';
        }
        
        alert('✅ Template created successfully!');
      } else {
        alert(`❌ Failed to create template: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('❌ Failed to create template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-content">
          {/* Left side - Form */}
          <div className="edit-form-section">
            <div className="modal-header">
              <h2>Create Card Template</h2>
              <button className="modal-close" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            {/* Template Info */}
            <div className="form-section">
              <h3>Template Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Template Name *</label>
                  <input
                    type="text"
                    value={templateData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Sales Team Template"
                    required
                  />
                </div>
                
                <div className="form-field">
                  <label>Description</label>
                  <input
                    type="text"
                    value={templateData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the template"
                  />
                </div>
              </div>
            </div>

            {/* Template Scope */}
            <div className="form-section">
              <h3>Template Scope</h3>
              <div className="form-grid">
                {(user?.role === 'Administrator' || user?.role === 'Admin') && (
                  <div className="form-field">
                    <label>Template Type</label>
                    <select
                      value={templateData.isEnterprise ? 'enterprise' : 'department'}
                      onChange={(e) => {
                        const isEnterprise = e.target.value === 'enterprise';
                        setTemplateData(prev => ({ 
                          ...prev, 
                          isEnterprise,
                          departmentId: isEnterprise ? null : prev.departmentId
                        }));
                      }}
                    >
                      <option value="enterprise">Enterprise Template (All Departments)</option>
                      <option value="department">Department Template</option>
                    </select>
                  </div>
                )}
                
                {!templateData.isEnterprise && (
                  <div className="form-field">
                    <label>Department</label>
                    <select
                      value={templateData.departmentId || ''}
                      onChange={(e) => handleInputChange('departmentId', e.target.value)}
                      required={!templateData.isEnterprise}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Available departments: {departments.length} found
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Logo Upload */}
            <div className="form-section">
              <h3>Company Logo (Optional)</h3>
              <div className="image-uploads">
                <div className="image-upload-item">
                  <div 
                    className="image-upload-preview clickable"
                    onClick={() => companyLogoRef.current?.click()}
                  >
                    {templateData.companyLogo ? (
                      <img src={templateData.companyLogo} alt="Company Logo" />
                    ) : (
                      <div className="image-placeholder">
                        <FaUpload />
                        <span>Company Logo</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={companyLogoRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  {templateData.companyLogo && (
                    <button 
                      className="remove-image-btn"
                      onClick={handleRemoveImage}
                      title="Remove company logo"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="form-section">
              <h3>Choose Color Scheme *</h3>
              <div className="theme-selection">
                <div className="theme-colors">
                  {themes.map(color => (
                    <div
                      key={color}
                      className={`theme-color ${selectedTheme === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedTheme(color)}
                    />
                  ))}
                </div>
                
                <div className="color-picker-section">
                  <button
                    type="button"
                    className="color-picker-btn"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <i className="fas fa-palette"></i>
                    Custom Color
                  </button>
                  
                  {showColorPicker && (
                    <div className="color-picker-container">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setSelectedTheme(e.target.value);
                        }}
                        className="color-picker-input"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                            setSelectedTheme(e.target.value);
                          }
                        }}
                        placeholder="#FF5733"
                        className="hex-input"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>

          {/* Right side - Preview */}
          <div className="edit-preview-section">
            <h3>Template Preview</h3>
            <div className="preview-card">
              <BusinessCardItem
                card={{
                  id: 'preview',
                  name: 'John',
                  surname: 'Doe',
                  occupation: 'Sample Position',
                  email: 'john.doe@company.com',
                  phone: '+1 (555) 123-4567',
                  company: 'Company Name',
                  colorScheme: templateData.colorScheme,
                  companyLogo: templateData.companyLogo,
                  profileImage: null,
                  departmentName: 'Sample Department'
                }}
                isPreview={true}
              />
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <p><strong>Template:</strong> {templateData.name || 'Untitled Template'}</p>
              <p><strong>Scope:</strong> {templateData.isEnterprise ? 'Enterprise-wide' : 'Department-specific'}</p>
              <p><strong>Color:</strong> {templateData.colorScheme}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessCards = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Use the custom hook for user context
  const userContext = useUserContext();
  const { user, hasPermission } = useUser();
  
  useEffect(() => {
    const fetchCards = async () => {
      // Wait for user context to be determined
      if (userContext.isLoading) {
        return;
      }
      
      try {
        setLoading(true);
        
        console.log('User context detected:', userContext);
        
        // Fetch cards based on user type
        const cardsData = await fetchCardsByUserType(userContext.isEnterprise, userContext.enterpriseId, userContext.userId);
        
        setCards(cardsData);
        // Auto-select first card if none selected
        if (cardsData.length > 0 && !selectedCard) {
          setSelectedCard(cardsData[0]);
        }
        setError(null);
        
        console.log('Processed cards data:', cardsData);
      } catch (err) {
        setError("Failed to fetch business cards. Please try again later.");
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, [userContext.isLoading, userContext.isEnterprise, userContext.enterpriseId, userContext.userId]);
  
  // Share functionality
  const handleShare = async (card: CardData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.name} ${card.surname} - Business Card`,
          text: `Check out ${card.name} ${card.surname}'s business card`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare(card);
      }
    } else {
      fallbackShare(card);
    }
  };

  const fallbackShare = (card: CardData) => {
    const shareText = `${card.name} ${card.surname}\n${card.occupation}\n${card.email}\n${card.phone}`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Card details copied to clipboard!');
    }).catch(() => {
      alert('Unable to share. Please copy the details manually.');
    });
  };

  // Delete card functionality
  const handleDeleteCard = async () => {
    if (!selectedCard) return;

    const cardIndex = cards.findIndex(c => c.id === selectedCard.id);
    
    // Prevent deletion of default card (index 0)
    if (cardIndex === 0) {
      alert('The default card cannot be deleted. This ensures you always have at least one card available.');
      return;
    }

    try {
      const endpoint = `${API_BASE_URL}/Cards/${userContext.userId}?cardIndex=${cardIndex}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${FIREBASE_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete card: ${response.status} ${response.statusText}`);
      }

      // Remove the card from local state
      const updatedCards = cards.filter(c => c.id !== selectedCard.id);
      setCards(updatedCards);
      
      // Select the first card if the deleted card was selected
      if (updatedCards.length > 0) {
        setSelectedCard(updatedCards[0]);
      } else {
        setSelectedCard(null);
      }

      setShowDeleteModal(false);
      alert('✅ Card deleted successfully!');
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('❌ Failed to delete card. Please try again.');
    }
  };

  // Filter cards based on search term
  const filteredCards = cards.filter(card => 
    `${card.name} ${card.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Show loading state while user context is being determined
  if (userContext.isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">Determining user type...</div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Cards</h1>
          <p className="page-description">
            {userContext.isEnterprise 
              ? "Manage and customize your enterprise digital business cards" 
              : "Manage and customize your digital business cards"
            }
          </p>
          <div className="user-type-indicator">
            <span className={`badge ${userContext.isEnterprise ? 'enterprise' : 'individual'}`}>
              {userContext.isEnterprise ? 'Enterprise' : 'Individual'} User
            </span>
            {user && (
              <span className="badge" style={{ 
                marginLeft: '0.5rem', 
                backgroundColor: user.role === 'Administrator' || user.role === 'Admin' ? '#1e40af' : 
                               user.role === 'Manager' || user.role === 'Lead' ? '#d97706' : '#059669'
              }}>
                {user.role}
              </span>
            )}
            {userContext.error && (
              <span className="badge error" style={{ marginLeft: '0.5rem', backgroundColor: '#dc2626' }}>
                {userContext.error}
              </span>
            )}
          </div>
        </div>
        <div className="page-actions">
          <Button 
            onClick={() => hasPermission('createBusinessCards') && setShowCreateModal(true)}
            disabled={!hasPermission('createBusinessCards')}
            style={{ 
              opacity: hasPermission('createBusinessCards') ? 1 : 0.5,
              backgroundColor: hasPermission('createBusinessCards') ? undefined : '#f5f5f5',
              cursor: hasPermission('createBusinessCards') ? 'pointer' : 'not-allowed'
            }}
            title={!hasPermission('createBusinessCards') ? 'Employees cannot create new cards' : 'Create a new business card'}
          >
            <FaQrcode className="mr-2" />
            Create Card
          </Button>
          
          {/* Template Creation Button - Only for Managers and Admins */}
          {(hasPermission('createBusinessCards') && (user?.role === 'Manager' || user?.role === 'Lead' || user?.role === 'Administrator' || user?.role === 'Admin')) && (
            <Button 
              variant="outline"
              onClick={() => setShowTemplateModal(true)}
              title="Create a card template for your department or enterprise"
              style={{ backgroundColor: '#f0f9ff', borderColor: '#3b82f6', color: '#1e40af' }}
            >
              <i className="fas fa-palette mr-2"></i>
              Create Template
            </Button>
          )}
          
          {selectedCard && (
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(true)}
              disabled={cards.findIndex(c => c.id === selectedCard.id) === 0}
              style={{ 
                opacity: cards.findIndex(c => c.id === selectedCard.id) === 0 ? 0.5 : 1,
                backgroundColor: cards.findIndex(c => c.id === selectedCard.id) === 0 ? '#f5f5f5' : undefined
              }}
            >
              <FaTimes className="mr-2" />
              {cards.findIndex(c => c.id === selectedCard.id) === 0 ? 'Default Card' : 'Delete Card'}
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">Loading business cards...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="cards-layout">
          {/* Card List Sidebar */}
          <div className="cards-sidebar">
            <div className="sidebar-header">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="cards-list">
              {filteredCards.length > 0 ? (
                filteredCards.map(card => (
                  <div 
                    key={card.id} 
                    className={`card-list-item ${selectedCard?.id === card.id ? 'active' : ''}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="card-list-avatar" style={{ backgroundColor: getCardColor(card.colorScheme) }}>
                      <span>{card.name[0]}{card.surname[0]}</span>
                    </div>
                    <div className="card-list-info">
                      <h4>{card.name} {card.surname}</h4>
                      <p>{card.occupation || card.employeeTitle}</p>
                      <span>{card.numberOfScan || 0} scans</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cards-list">
                  <p>No cards found</p>
                  {searchTerm && <p>Try adjusting your search</p>}
                </div>
              )}
            </div>
          </div>
          
          {/* Selected Card Display */}
          <div className="card-display">
            {selectedCard ? (
              <div className="selected-card-container">
                <BusinessCardItem 
                  card={selectedCard}
                  onQRClick={() => setShowQRModal(true)}
                  onShareClick={() => handleShare(selectedCard)}
                  onEditClick={() => setShowEditModal(true)}
                />
                <div className="card-actions-panel">
                  <Button onClick={() => setShowQRModal(true)}>
                    <FaQrcode className="mr-2" />
                    QR Code
                  </Button>
                  <Button variant="outline" onClick={() => handleShare(selectedCard)}>
                    <FaShare className="mr-2" />
                    Share Card
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditModal(true)}>
                    <FaEdit className="mr-2" />
                    Edit Card
                  </Button>
                </div>
              </div>
            ) : (
              <div className="no-card-selected">
                <p>Select a card from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modals */}
      {selectedCard && (
        <>
          <QRCodeModal 
            card={selectedCard}
            cardIndex={cards.findIndex(c => c.id === selectedCard.id)}
            userId={userContext.userId || ''}
            isOpen={showQRModal} 
            onClose={() => setShowQRModal(false)} 
          />
          <EditCardModal 
            card={selectedCard} 
            cards={cards}
            userContext={userContext}
            isOpen={showEditModal} 
            onClose={() => setShowEditModal(false)}
            onSave={(updatedCard) => {
              setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));
              setSelectedCard(updatedCard);
            }}
          />
        </>
      )}
      
      {/* Create Card Modal */}
      <CreateCardModal 
        userContext={userContext}
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSave={(newCard) => {
          setCards([...cards, newCard]);
          setSelectedCard(newCard);
        }}
      />

      {/* Create Template Modal */}
      <CreateTemplateModal 
        userContext={userContext}
        user={user}
        isOpen={showTemplateModal} 
        onClose={() => setShowTemplateModal(false)}
        onSave={(newTemplate) => {
          console.log('Template created:', newTemplate);
          // You can add template list refresh logic here if needed
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCard && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Card</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this card?</p>
              <p><strong>{selectedCard.name} {selectedCard.surname}</strong></p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteCard}
                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
              >
                Delete Card
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCards;

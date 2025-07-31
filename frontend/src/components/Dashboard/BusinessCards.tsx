import { useState, useEffect, useRef } from "react";
import { FaSearch, FaQrcode, FaShare, FaEdit, FaTimes, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaSnapchat, FaWhatsapp, FaTelegram, FaDiscord, FaSkype, FaGithub, FaPinterest, FaTwitch, FaSpotify, FaSoundcloud, FaBehance, FaDribbble, FaMedium, FaReddit, FaTumblr, FaVimeo, FaUpload, FaPalette } from "react-icons/fa";
import { Button } from "../UI/button";
import "../../styles/BusinessCards.css";
import "../../styles/Dashboard.css";
import { ENDPOINTS, buildEnterpriseUrl, getEnterpriseHeaders, buildUrl, FIREBASE_TOKEN, API_BASE_URL } from "../../utils/api";
import { useUserContext } from "../../hooks/useUserContext";

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

const BusinessCardItem = ({ card, isPreview = false }: { card: CardData; isPreview?: boolean }) => {
  return (
    <div key={card.id} className={`business-card ${isPreview ? 'preview-card' : ''}`}>
      <div className="business-card-content">
        <div className="business-card-left" style={{ backgroundColor: getCardColor(card.colorScheme) }}>
          {card.profileImage ? (
            <div className="profile-image">
              <img src={card.profileImage} alt="Profile" />
            </div>
          ) : (
            <div className="xscard-logo">
              <span>XS</span>
            </div>
          )}
          {card.companyLogo && (
            <div className="company-logo">
              <img src={card.companyLogo} alt="Company Logo" />
            </div>
          )}
        </div>
        
        <div className="business-card-right">
          <div className="business-card-info">
            <h3 className="business-card-name">{card.name} {card.surname}</h3>
            <p className="business-card-title">{card.occupation || card.employeeTitle || 'N/A'}</p>
            {card.departmentName && card.departmentName !== 'N/A' && (
              <p className="business-card-department">{card.departmentName}</p>
            )}
          </div>
          
          <div className="business-card-contact-info">
            <p className="business-card-email">{card.email}</p>
            <p className="business-card-phone">{card.phone}</p>
          </div>
          
          {/* Social Media Links */}
          <div className="business-card-socials">
            {socialPlatforms.map(platform => {
              const IconComponent = platform.icon;
              const socialData = card[platform.key as keyof CardData] as { link: string; title: string } | string | undefined;
              
              // Handle both old format (string) and new format (object)
              let link = '';
              let title = '';
              
              if (typeof socialData === 'string' && socialData.trim() !== '') {
                // Old format - use the string as link and platform name as title
                link = socialData;
                title = platform.name;
              } else if (socialData && typeof socialData === 'object' && 'link' in socialData) {
                // New format
                link = socialData.link || '';
                title = socialData.title || platform.name;
              }
              
              if (link && title) {
                return (
                  <div key={platform.key} className="social-item">
                    <div 
                      className="social-icon" 
                      style={{ backgroundColor: getCardColor(card.colorScheme) }}
                      onClick={() => window.open(link, '_blank')}
                      title={`Open ${platform.name}`}
                    >
                      <IconComponent />
                    </div>
                    <span className="social-title">{title}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
          
          <div className="business-card-footer">
            <span className="business-card-scans">{card.numberOfScan || 0} scans</span>
            <div className="business-card-actions">
              <button className="action-button" title="QR Code">
                <FaQrcode />
              </button>
              <button className="action-button" title="Share">
                <FaShare />
              </button>
              <button className="action-button" title="Edit">
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

// Edit Card Modal Component
const EditCardModal = ({ card, isOpen, onClose, onSave }: { 
  card: CardData; 
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
    setEditedCard(prev => ({ ...prev, [platformKey]: data }));
  };

  const handleImageUpload = (field: 'profileImage' | 'companyLogo', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEditedCard(prev => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(editedCard);
    onClose();
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
                  const socialData = editedCard[platform.key as keyof CardData] as { link: string; title: string } | undefined;
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
          currentData={editedCard[activeSocialModal as keyof CardData] as { link: string; title: string } | undefined}
        />
      )}
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
  
  // Use the custom hook for user context
  const userContext = useUserContext();
  
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
            {userContext.error && (
              <span className="badge error" style={{ marginLeft: '0.5rem', backgroundColor: '#dc2626' }}>
                {userContext.error}
              </span>
            )}
          </div>
        </div>
        <div className="page-actions">
          <Button>
            <FaQrcode className="mr-2" />
            Create Card
          </Button>
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
                <BusinessCardItem card={selectedCard} />
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
            isOpen={showEditModal} 
            onClose={() => setShowEditModal(false)}
            onSave={(updatedCard) => {
              setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));
              setSelectedCard(updatedCard);
            }}
          />
        </>
      )}
    </div>
  );
};

export default BusinessCards;

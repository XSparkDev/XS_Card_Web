import React, { createContext, useContext, useEffect, useState } from "react";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import SessionTimeoutModal from "../components/Dashboard/SessionTimeoutModal";

interface SessionTimeoutContextType {
  sessionTimeout: number;
  updateSessionTimeout: (minutes: number) => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | null>(null);

export const useSessionTimeoutContext = () => {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error("useSessionTimeoutContext must be used within SessionTimeoutProvider");
  }
  return context;
};

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({ children }) => {
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30); // Default 30 minutes
  
  // TODO: Load session timeout from Firestore when firebase is configured
  useEffect(() => {
    // Simulating loading from storage/firestore
    const savedTimeout = localStorage.getItem("sessionTimeout");
    if (savedTimeout) {
      const timeoutMap: { [key: string]: number } = {
        "15 minutes": 15,
        "1 hour": 60,
        "24 hours": 1440,
        "14 days": 20160,
      };
      setSessionTimeoutMinutes(timeoutMap[savedTimeout] || 30);
    }
  }, []);

  const updateSessionTimeout = (minutes: number) => {
    setSessionTimeoutMinutes(minutes);
    // TODO: Save to Firestore when firebase is configured
    // For now, save to localStorage
    const timeoutString = 
      minutes === 15 ? "15 minutes" :
      minutes === 60 ? "1 hour" :
      minutes === 1440 ? "24 hours" :
      minutes === 20160 ? "14 days" : "30 minutes";
    localStorage.setItem("sessionTimeout", timeoutString);
  };

  const { showWarning, remainingTime, extendSession, logout } = useSessionTimeout({
    timeoutMinutes: sessionTimeoutMinutes,
    warningMinutes: 2,
    onWarning: () => {
      console.log("Session timeout warning triggered");
    },
    onTimeout: () => {
      console.log("Session timed out");
    },
  });

  return (
    <SessionTimeoutContext.Provider value={{ sessionTimeout: sessionTimeoutMinutes, updateSessionTimeout }}>
      {children}
      <SessionTimeoutModal
        isOpen={showWarning}
        remainingTime={remainingTime}
        onExtend={extendSession}
        onLogout={logout}
      />
    </SessionTimeoutContext.Provider>
  );
}; 
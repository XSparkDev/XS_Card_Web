import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../UI/dialog";
import { Button } from "../UI/button";
import { FaClock, FaExclamationTriangle } from "react-icons/fa";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingTime: number;
  onExtend: () => void;
  onLogout: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingTime,
  onExtend,
  onLogout,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
            <DialogTitle className="text-xl">Session Timeout Warning</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Your session is about to expire due to inactivity. Would you like to continue working?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <div className="flex items-center gap-2 text-3xl font-bold text-gray-800">
            <FaClock className="text-gray-600" />
            <span>{formatTime(remainingTime)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Time remaining</p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
          <Button onClick={onExtend}>
            Stay Logged In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTimeoutModal; 
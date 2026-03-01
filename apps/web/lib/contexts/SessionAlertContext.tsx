'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { AlertTriangle, LogOut, Clock } from 'lucide-react';
import { setGlobalSessionAlertHandler } from '@/lib/api/axios';

interface SessionAlert {
  type: 'idle' | 'device' | 'expired';
  title: string;
  message: string;
  onConfirm: () => void;
}

interface InactivityWarning {
  countdownSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

interface SessionAlertContextType {
  showIdleAlert: (onConfirm: () => void) => void;
  showDeviceAlert: (onConfirm: () => void) => void;
  showExpiredAlert: (onConfirm: () => void) => void;
  showInactivityWarning: (onExtend: () => void, onLogout: () => void, countdownSeconds?: number) => void;
  hideInactivityWarning: () => void;
}

const SessionAlertContext = createContext<SessionAlertContextType | undefined>(undefined);

export function SessionAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<SessionAlert | null>(null);
  const [inactivityWarning, setInactivityWarning] = useState<InactivityWarning | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const router = useRouter();

  const showIdleAlert = useCallback((onConfirm: () => void) => {
    setAlert({
      type: 'idle',
      title: 'Session Expired',
      message: 'You have been logged out due to inactivity. Please log in again to continue.',
      onConfirm,
    });
  }, []);

  const showDeviceAlert = useCallback((onConfirm: () => void) => {
    setAlert({
      type: 'device',
      title: 'Logged In From Another Device',
      message: 'Your account has been accessed from another device. For security reasons, you have been logged out from this session.',
      onConfirm,
    });
  }, []);

  const showExpiredAlert = useCallback((onConfirm: () => void) => {
    setAlert({
      type: 'expired',
      title: 'Session Expired',
      message: 'Your session has expired. Please log in again to continue.',
      onConfirm,
    });
  }, []);

  const showInactivityWarning = useCallback((onExtend: () => void, onLogout: () => void, countdownSeconds: number = 60) => {
    setInactivityWarning({
      countdownSeconds,
      onExtend,
      onLogout,
    });
    setCountdown(countdownSeconds);
  }, []);

  const hideInactivityWarning = useCallback(() => {
    setInactivityWarning(null);
    setCountdown(0);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!inactivityWarning || countdown <= 0) {
      if (inactivityWarning && countdown <= 0) {
        // Time's up, logout
        inactivityWarning.onLogout();
        setInactivityWarning(null);
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [inactivityWarning, countdown]);

  // Register global session alert handler for axios interceptor
  useEffect(() => {
    setGlobalSessionAlertHandler((type) => {
      if (type === 'device') {
        showDeviceAlert(() => {
          router.push('/login');
        });
      } else if (type === 'expired') {
        showExpiredAlert(() => {
          router.push('/login');
        });
      }
    });

    return () => {
      setGlobalSessionAlertHandler(() => {});
    };
  }, [router, showDeviceAlert, showExpiredAlert]);

  const handleConfirm = () => {
    if (alert) {
      alert.onConfirm();
      setAlert(null);
    }
  };

  const getIcon = () => {
    if (!alert) return null;

    switch (alert.type) {
      case 'idle':
        return <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />;
      case 'device':
        return <LogOut className="h-12 w-12 text-red-500 mx-auto mb-4" />;
      case 'expired':
        return <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />;
      default:
        return null;
    }
  };

  const handleExtendSession = () => {
    if (inactivityWarning) {
      inactivityWarning.onExtend();
      hideInactivityWarning();
    }
  };

  const handleLogoutNow = () => {
    if (inactivityWarning) {
      inactivityWarning.onLogout();
      hideInactivityWarning();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SessionAlertContext.Provider value={{ showIdleAlert, showDeviceAlert, showExpiredAlert, showInactivityWarning, hideInactivityWarning }}>
      {children}

      {/* Session Alert Dialog */}
      <Dialog open={!!alert} onOpenChange={(open) => !open && setAlert(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            {getIcon()}
            <DialogTitle className="text-center text-xl">{alert?.title}</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              {alert?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button
              onClick={handleConfirm}
              className="w-full sm:w-auto min-w-[120px]"
              variant={alert?.type === 'device' ? 'destructive' : 'default'}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inactivity Warning Dialog */}
      <Dialog open={!!inactivityWarning} onOpenChange={(open) => !open && hideInactivityWarning()}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <DialogTitle className="text-center text-xl">Session Timeout Warning</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              You will be logged out due to inactivity in:
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center my-6">
            <div className="text-6xl font-bold text-orange-500 tabular-nums">
              {formatTime(countdown)}
            </div>
          </div>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Click "Extend Session" to continue working, or you will be automatically logged out.
          </DialogDescription>
          <DialogFooter className="sm:justify-center gap-2 mt-4">
            <Button
              onClick={handleLogoutNow}
              variant="outline"
              className="w-full sm:w-auto min-w-[120px]"
            >
              Logout Now
            </Button>
            <Button
              onClick={handleExtendSession}
              className="w-full sm:w-auto min-w-[120px]"
            >
              Extend Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SessionAlertContext.Provider>
  );
}

export function useSessionAlert() {
  const context = useContext(SessionAlertContext);
  if (context === undefined) {
    throw new Error('useSessionAlert must be used within a SessionAlertProvider');
  }
  return context;
}

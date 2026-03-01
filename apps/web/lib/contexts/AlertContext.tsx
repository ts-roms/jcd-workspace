'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react';

type AlertType = 'error' | 'warning' | 'success' | 'info';

interface Alert {
  type: AlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showError: (message: string, options?: { title?: string; onConfirm?: () => void }) => void;
  showWarning: (message: string, options?: { title?: string; onConfirm?: () => void }) => void;
  showSuccess: (message: string, options?: { title?: string; onConfirm?: () => void }) => void;
  showInfo: (message: string, options?: { title?: string; onConfirm?: () => void }) => void;
  showConfirm: (
    message: string,
    options: {
      title?: string;
      onConfirm: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    },
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showError = useCallback(
    (message: string, options?: { title?: string; onConfirm?: () => void }) => {
      setAlert({
        type: 'error',
        title: options?.title || 'Error',
        message,
        onConfirm: options?.onConfirm,
        confirmText: 'OK',
      });
    },
    [],
  );

  const showWarning = useCallback(
    (message: string, options?: { title?: string; onConfirm?: () => void }) => {
      setAlert({
        type: 'warning',
        title: options?.title || 'Warning',
        message,
        onConfirm: options?.onConfirm,
        confirmText: 'OK',
      });
    },
    [],
  );

  const showSuccess = useCallback(
    (message: string, options?: { title?: string; onConfirm?: () => void }) => {
      setAlert({
        type: 'success',
        title: options?.title || 'Success',
        message,
        onConfirm: options?.onConfirm,
        confirmText: 'OK',
      });
    },
    [],
  );

  const showInfo = useCallback(
    (message: string, options?: { title?: string; onConfirm?: () => void }) => {
      setAlert({
        type: 'info',
        title: options?.title || 'Information',
        message,
        onConfirm: options?.onConfirm,
        confirmText: 'OK',
      });
    },
    [],
  );

  const showConfirm = useCallback(
    (
      message: string,
      options: {
        title?: string;
        onConfirm: () => void;
        onCancel?: () => void;
        confirmText?: string;
        cancelText?: string;
      },
    ) => {
      setAlert({
        type: 'warning',
        title: options.title || 'Confirm',
        message,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
      });
    },
    [],
  );

  const handleConfirm = () => {
    if (alert?.onConfirm) {
      alert.onConfirm();
    }
    setAlert(null);
  };

  const handleCancel = () => {
    if (alert?.onCancel) {
      alert.onCancel();
    }
    setAlert(null);
  };

  const getIcon = () => {
    if (!alert) return null;

    const iconClasses = 'h-12 w-12 mx-auto mb-4';

    switch (alert.type) {
      case 'error':
        return <XCircle className={`${iconClasses} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-yellow-500`} />;
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-500`} />;
      case 'info':
        return <Info className={`${iconClasses} text-blue-500`} />;
      default:
        return null;
    }
  };

  const getButtonVariant = () => {
    if (!alert) return 'default';

    switch (alert.type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <AlertContext.Provider
      value={{ showError, showWarning, showSuccess, showInfo, showConfirm }}
    >
      {children}

      <Dialog open={!!alert} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            {getIcon()}
            <DialogTitle className="text-center text-xl">{alert?.title}</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              {alert?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4 gap-2">
            {alert?.onCancel !== undefined && (
              <Button onClick={handleCancel} variant="outline" className="min-w-[120px]">
                {alert.cancelText || 'Cancel'}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              className="min-w-[120px]"
              variant={getButtonVariant() as any}
            >
              {alert?.confirmText || 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

import React from 'react';
import { Toast } from './Toast';
import { useToast } from '@/hooks/toast-store';

export const GlobalToast: React.FC = () => {
  const { toast, hideToast } = useToast();

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      visible={toast.visible}
      onHide={hideToast}
      testID="global-toast"
    />
  );
};
"use client";

import { useEffect } from 'react';
import { useAlert } from '@/components/ui/Alert';
import { setGlobalAlertContext } from '@/lib/customAlert';

export const AlertInitializer: React.FC = () => {
  const alertContext = useAlert();

  useEffect(() => {
    setGlobalAlertContext(alertContext);
  }, [alertContext]);

  return null;
};

'use client';

import { useEffect } from 'react';

export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const id = window.setTimeout(onClose, 2600);
    return () => clearTimeout(id);
  }, [onClose]);

  return <div className="toast">{message}</div>;
};

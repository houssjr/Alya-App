import { useEffect, useState } from 'react';

let toastSetter = null;

export function showToast(type, message) {
  if (toastSetter) {
    toastSetter({ type, message });
  }
}

export function ToastContainer() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    toastSetter = setToast;

    return () => {
      toastSetter = null;
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      <div className={`toast ${toast.type}`}>{toast.message}</div>
    </div>
  );
}

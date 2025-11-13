import { useCallback, useEffect, useState } from 'react';

const SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';

export const useMidtransSnap = () => {
  const [isReady, setReady] = useState(false);
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

  useEffect(() => {
    if (window.snap || !clientKey) {
      setReady(Boolean(window.snap));
      return;
    }
    const script = document.createElement('script');
    script.src = `${SNAP_URL}`;
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => setReady(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [clientKey]);

  const openSnap = useCallback((token, callbacks = {}) => {
    if (!window.snap || !token) return;
    window.snap.pay(token, callbacks);
  }, []);

  return { isReady, openSnap };
};

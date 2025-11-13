import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const getQrBoxSize = () => {
  if (typeof window === 'undefined') {
    return 280;
  }
  const responsiveSize = Math.floor(window.innerWidth * 0.45);
  return Math.min(360, Math.max(240, responsiveSize));
};

const OperatorScanner = ({ onResult }) => {
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const html5QrcodeRef = useRef(null);
  const isRunningRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const callbackRef = useRef(onResult);
  const qrboxSize = useMemo(() => getQrBoxSize(), []);
  const [isPaused, setIsPaused] = useState(false);
  const [restartToken, setRestartToken] = useState(0);

  useEffect(() => {
    callbackRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const elementId = 'qr-reader';
    const scanner = new Html5Qrcode(elementId);
    html5QrcodeRef.current = scanner;
    setError(null);

    const startScanner = () =>
      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } },
          (decodedText) => {
            callbackRef.current?.(decodedText);
            setIsPaused(true);
            scanner
              .pause(true)
              .then(() => {
                if (resumeTimeoutRef.current) {
                  clearTimeout(resumeTimeoutRef.current);
                }
                resumeTimeoutRef.current = window.setTimeout(() => {
                  if (html5QrcodeRef.current === scanner) {
                    scanner.resume().catch(() => null);
                    setIsPaused(false);
                  }
                }, 800);
              })
              .catch(() => null);
          },
          (scanError) => {
            const message = typeof scanError === 'string' ? scanError : scanError?.message;
            if (message) {
              setError(message);
            }
          }
        )
        .then(() => {
          isRunningRef.current = true;
          setIsPaused(false);
        })
        .catch((err) => {
          const message = typeof err === 'string' ? err : err?.message || 'Camera error';
          setError(message);
        });

    startScanner();

    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      const instance = html5QrcodeRef.current;
      html5QrcodeRef.current = null;
      if (!instance) {
        return;
      }
      const stopPromise = isRunningRef.current ? instance.stop().catch(() => null) : Promise.resolve();
      stopPromise.finally(() => {
        instance.clear().catch(() => null);
        isRunningRef.current = false;
      });
    };
  }, [qrboxSize, restartToken]);

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!code) {
      return;
    }
    callbackRef.current?.(code);
    setManualCode('');
  };

  const handleRestart = () => {
    setError(null);
    setIsPaused(false);
    setRestartToken((token) => token + 1);
  };

  return (
    <div className="glass-panel rounded-3xl p-5">
      <p className="font-semibold">Scan QR</p>
      <div
        id="qr-reader"
        className="mt-3 w-full overflow-hidden rounded-2xl bg-black/20"
        style={{ minHeight: `${qrboxSize + 120}px`, maxHeight: 440 }}
      />
      {isPaused && (
        <p className="mt-2 text-xs text-amber-600">Scanner paused sesaat setelah validasi.</p>
      )}
      <button
        type="button"
        onClick={handleRestart}
        className="mt-2 text-xs font-semibold text-gold underline-offset-2 hover:underline"
      >
        Reload Kamera
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <div className="mt-4 flex gap-2">
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Masukkan kode manual"
          className="flex-1 rounded-2xl border border-cream/70 bg-transparent px-3 py-2 text-sm"
        />
        <button onClick={handleManualSubmit} className="rounded-2xl bg-gold px-4 text-sm font-semibold text-ebony">
          Validasi
        </button>
      </div>
    </div>
  );
};

export default OperatorScanner;

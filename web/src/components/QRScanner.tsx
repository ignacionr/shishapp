'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Camera, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: Props) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detector: any = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Use Native Barcode Detector if available
        if ('BarcodeDetector' in window) {
          detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          
          const scan = async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  // Handle absolute URLs or just the code
                  let code = rawValue;
                  if (rawValue.includes('/dl/')) {
                    code = rawValue.split('/dl/')[1].split('?')[0];
                  }
                  
                  setIsScanning(false);
                  onScan(code);
                  return; // Stop scanning
                }
              } catch (e) {
                console.error('Detection error:', e);
              }
            }
            if (isScanning) {
              animationId = requestAnimationFrame(scan);
            }
          };
          scan();
        } else {
          setError("Native Barcode Detector not supported in this browser.");
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError("Could not access camera. Please ensure permissions are granted.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [onScan, isScanning]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center text-white">
        <h3 className="font-black uppercase tracking-widest text-sm">{t.scan_qr}</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-white w-full max-w-sm">
            <AlertCircle size={48} className="mx-auto mb-4 text-orange-500" />
            <p className="font-bold mb-8 text-sm">{error}</p>
            
            <div className="space-y-4">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">Manual Entry</label>
                  <input 
                    type="text" 
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="Enter code (e.g. 123)"
                    className="w-full bg-stone-900 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none"
                  />
               </div>
               <button 
                onClick={() => manualCode && onScan(manualCode)}
                disabled={!manualCode}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
               >
                 Confirm Code
               </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Scanner Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    
                    {/* Scanning animation line */}
                    <div className="absolute left-0 right-0 h-1 bg-white/30 animate-scan"></div>
                </div>
                <p className="mt-8 text-white font-black uppercase tracking-widest text-xs animate-pulse">
                  {t.scanning}
                </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
          position: absolute;
        }
      `}</style>
    </div>
  );
}

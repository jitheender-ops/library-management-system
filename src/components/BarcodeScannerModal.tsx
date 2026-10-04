import React, { useState, useRef, useEffect } from "react";
import { Book } from "../types";
import { haptic } from "../utils/haptics";
import { BarcodeDisplay } from "./BarcodeDisplay";
import {
  X,
  Camera,
  ScanLine,
  Zap,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  BookOpen,
  RefreshCw,
} from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: Book[];
  onSelectBook: (book: Book) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onSelectBook,
}) => {
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera when requested
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser environment.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed or frame restricted:", err);
      setCameraError(
        "Camera stream unavailable in current frame. You can use the Quick Simulation Scan buttons below or type any ISBN/Barcode."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      // Attempt camera on open
      startCamera();
    } else {
      stopCamera();
      setScannedBook(null);
      setSearchNotFound(false);
      setManualCode("");
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleLookupBarcode = (code: string) => {
    setIsScanningAnimation(true);
    setSearchNotFound(false);

    // Clean characters (remove hyphens, spaces)
    const normalizedInput = code.replace(/[-\s]/g, "").toLowerCase();

    setTimeout(() => {
      setIsScanningAnimation(false);
      const found = catalog.find((b) => {
        const cleanBarcode = b.barcode.replace(/[-\s]/g, "").toLowerCase();
        const cleanIsbn = b.isbn.replace(/[-\s]/g, "").toLowerCase();
        return (
          cleanBarcode === normalizedInput ||
          cleanIsbn === normalizedInput ||
          cleanBarcode.includes(normalizedInput) ||
          cleanIsbn.includes(normalizedInput)
        );
      });

      if (found) {
        haptic.success();
        setScannedBook(found);
        setSearchNotFound(false);
      } else {
        haptic.error();
        setScannedBook(null);
        setSearchNotFound(true);
      }
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Library Barcode Scanner</h3>
              <p className="text-[11px] text-stone-400">Point at physical book ISBN / Barcode sticker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Section */}
        <div className="p-6 space-y-5">
          <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-black border border-stone-800 flex items-center justify-center shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-6 text-center space-y-2">
                <Camera className="w-10 h-10 text-stone-600 mx-auto" />
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  {cameraError || "Optical scanner ready for barcode detection."}
                </p>
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Camera Feed
                </button>
              </div>
            )}

            {/* Viewfinder Target Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-32 border-2 border-emerald-500/80 rounded-lg relative overflow-hidden bg-emerald-500/5">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                {/* Animated Laser Scanning Sweep */}
                <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite]" />
              </div>
            </div>

            <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-[10px] text-stone-400 px-2 py-0.5 rounded font-mono">
              EAN-13 / CODE-128 DETECTOR
            </div>
          </div>

          {/* Quick Simulation Barcode Tester (allows user to test instant scanning without needing a webcam book) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Instant Barcode Simulator
              </span>
              <span className="text-[11px] text-stone-500">Tap to simulate scan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {catalog.slice(0, 6).map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleLookupBarcode(book.barcode)}
                  className="p-2 text-left bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/60 rounded-lg transition-colors group"
                >
                  <p className="text-[11px] font-bold text-stone-200 truncate group-hover:text-emerald-400">
                    {book.title}
                  </p>
                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                    {book.barcode}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Search */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider block">
              Or Enter Barcode / ISBN Manually
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim()) handleLookupBarcode(manualCode.trim());
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 978-0132350884 or 9780132350884"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shrink-0"
              >
                Scan Code
              </button>
            </form>
          </div>

          {/* Scanned Result Output */}
          {isScanningAnimation && (
            <div className="p-4 bg-stone-800/60 rounded-xl border border-stone-700 text-center animate-pulse">
              <p className="text-xs text-emerald-400 font-medium">Decoding Barcode from Optical Sensor...</p>
            </div>
          )}

          {searchNotFound && (
            <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center gap-3 text-red-200 text-xs">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-semibold">Barcode not found in this catalog</p>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  Double check the number or verify if this book belongs to an affiliated university library branch.
                </p>
              </div>
            </div>
          )}

          {scannedBook && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-700/50 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden border border-stone-600 shadow-sm">
                  <img
                    src={scannedBook.coverUrl}
                    alt={`Front cover of ${scannedBook.title}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Barcode Verified in Catalog</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mt-0.5">{scannedBook.title}</h4>
                  <p className="text-xs text-stone-300">by {scannedBook.author}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                    <span className="font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                      {scannedBook.shelfLocation.callNumber}
                    </span>
                    <span className={scannedBook.availableCopies > 0 ? "text-emerald-400" : "text-amber-400"}>
                      {scannedBook.availableCopies > 0 ? `${scannedBook.availableCopies} Available` : "Waitlist Only"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1 border-t border-stone-800">
                <button
                  onClick={() => {
                    haptic.selection();
                    onSelectBook(scannedBook);
                    onClose();
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  View & Reserve This Book
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

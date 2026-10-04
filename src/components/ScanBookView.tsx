import React, { useState } from "react";
import { Book } from "../types";
import { haptic } from "../utils/haptics";
import {
  QrCode,
  ScanLine,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";

interface ScanBookViewProps {
  catalog: Book[];
  onSelectBook: (book: Book) => void;
  onCheckOutBook?: (book: Book) => void;
  onCheckInBook?: (book: Book) => void;
  onOpenCamera?: () => void;
}

const ScanBookViewComponent: React.FC<ScanBookViewProps> = ({
  catalog,
  onSelectBook,
  onCheckOutBook,
  onCheckInBook,
  onOpenCamera,
}) => {
  const [scanMode, setScanMode] = useState<"checkout" | "checkin">("checkout");
  const [manualId, setManualId] = useState("");
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    const query = manualId.trim().toLowerCase();
    const found = catalog.find(
      (b) =>
        b.barcode.toLowerCase() === query ||
        b.isbn.toLowerCase() === query ||
        b.id.toLowerCase() === query ||
        b.title.toLowerCase().includes(query)
    );

    if (found) {
      haptic.success();
      if (scanMode === "checkout" && onCheckOutBook) {
        onCheckOutBook(found);
      } else if (scanMode === "checkin" && onCheckInBook) {
        onCheckInBook(found);
      }
      setScannedFeedback(
        `Scanned "${found.title}" for ${scanMode === "checkout" ? "Check-Out" : "Check-In"}!`
      );
      setManualId("");
      setTimeout(() => setScannedFeedback(null), 4000);
    } else {
      haptic.error();
      setScannedFeedback(`No book found matching ID / barcode "${manualId}".`);
      setTimeout(() => setScannedFeedback(null), 3000);
    }
  };

  const handleQuickDemoScan = (book: Book) => {
    haptic.success();
    if (scanMode === "checkout" && onCheckOutBook) {
      onCheckOutBook(book);
    } else if (scanMode === "checkin" && onCheckInBook) {
      onCheckInBook(book);
    }
    setScannedFeedback(
      `Scanned "${book.title}" for ${scanMode === "checkout" ? "Check-Out" : "Check-In"}!`
    );
    setTimeout(() => setScannedFeedback(null), 4000);
  };

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold text-stone-900 tracking-tight">Scan Book</h1>

      {/* Camera / Viewfinder Box matching Screen 8 in image */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-center text-white relative overflow-hidden shadow-md flex flex-col items-center justify-center min-h-[320px]">
        {/* Ambient glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Scan Frame with Corner Reticles matching the image */}
        <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Top-left corner */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
          {/* Top-right corner */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
          {/* Bottom-left corner */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
          {/* Bottom-right corner */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>

          {/* Animated Laser line */}
          <div className="absolute left-4 right-4 h-0.5 bg-blue-400 shadow-[0_0_12px_#60A5FA] animate-pulse"></div>

          {/* Center QR/Barcode Icon */}
          <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <QrCode className="w-16 h-16 stroke-1.5" />
          </div>
        </div>

        <div className="mt-5 space-y-1 z-10 max-w-xs">
          <div className="text-sm font-bold text-white tracking-tight">Scan Book QR Code</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Place the QR code or barcode within the frame to check-in or check-out a book.
          </p>
          {onOpenCamera && (
            <button
              type="button"
              onClick={() => {
                haptic.medium();
                onOpenCamera();
              }}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Open Camera Scanner
            </button>
          )}
        </div>
      </div>

      {scannedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{scannedFeedback}</span>
        </div>
      )}

      {/* Mode Toggle matching Screen 8 in image */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={scanMode === "checkout"}
          data-haptic="selection"
          onClick={() => {
            haptic.selection();
            setScanMode("checkout");
          }}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            scanMode === "checkout"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <span>Check Out</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={scanMode === "checkin"}
          data-haptic="selection"
          onClick={() => {
            haptic.selection();
            setScanMode("checkin");
          }}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            scanMode === "checkin"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          <span>Check In</span>
        </button>
      </div>

      {/* Manual Book ID Entry matching Screen 8 in image */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
        <label className="text-xs font-bold text-stone-700">Or enter Book ID / Barcode</label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Enter book ID or scan code..."
            className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Quick Demo Book Scans */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Quick Demo Barcodes (Click to test scanner)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {catalog.slice(0, 4).map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => handleQuickDemoScan(book)}
              className="p-2 text-left bg-white hover:bg-blue-50 border border-stone-200 rounded-xl transition-all flex items-center gap-2 shadow-xs group"
            >
              <div className="w-8 aspect-3/4 rounded bg-stone-100 overflow-hidden shrink-0">
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-stone-900 truncate group-hover:text-blue-600">
                  {book.title}
                </div>
                <div className="text-[9px] text-stone-500 font-mono">{book.barcode}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ScanBookView = React.memo(ScanBookViewComponent);

import React, { useState } from "react";
import { LibraryFineSummary, FineTransaction } from "../types";
import { haptic } from "../utils/haptics";
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  X,
} from "lucide-react";

interface FinesPaymentsViewProps {
  fineSummary: LibraryFineSummary;
  onPayFines: (amount: number, method: string) => void;
}

const FinesPaymentsViewComponent: React.FC<FinesPaymentsViewProps> = ({
  fineSummary,
  onPayFines,
}) => {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "student-account">("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = () => {
    haptic.success();
    setIsProcessing(true);
    setTimeout(() => {
      onPayFines(fineSummary.totalDue, selectedMethod);
      setIsProcessing(false);
      setPayModalOpen(false);
    }, 800);
  };

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold text-stone-900 tracking-tight">Fines & Payments</h1>

      {/* Fine Summary Card matching Screen 7 in image */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Fine Summary</span>
        </div>

        <div>
          <div className="text-[11px] font-medium text-stone-500">Total Due</div>
          <div className="text-3xl font-black text-stone-900 tracking-tight flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-stone-600">₹</span>
            <span>{fineSummary.totalDue.toFixed(2)}</span>
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {fineSummary.overdueCount} overdue item
          </div>
        </div>

        {/* 3-Column Breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
          <div className="p-2 bg-stone-50 rounded-xl">
            <div className="text-[10px] text-stone-500 font-medium">Book Fines</div>
            <div className="text-xs font-bold text-stone-800 mt-0.5">
              ₹ {fineSummary.bookFines.toFixed(2)}
            </div>
          </div>
          <div className="p-2 bg-stone-50 rounded-xl">
            <div className="text-[10px] text-stone-500 font-medium">Lost/Damaged</div>
            <div className="text-xs font-bold text-stone-800 mt-0.5">
              ₹ {fineSummary.lostDamagedFines.toFixed(2)}
            </div>
          </div>
          <div className="p-2 bg-stone-50 rounded-xl">
            <div className="text-[10px] text-stone-500 font-medium">Other Charges</div>
            <div className="text-xs font-bold text-stone-800 mt-0.5">
              ₹ {fineSummary.otherCharges.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Pay Now Primary Button */}
      {fineSummary.totalDue > 0 ? (
        <button
          type="button"
          onClick={() => setPayModalOpen(true)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Now (₹ {fineSummary.totalDue.toFixed(2)})</span>
        </button>
      ) : (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your account is in good standing! No outstanding fines.</span>
        </div>
      )}

      {/* Recent Transactions List matching Screen 7 in image */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-stone-500" />
            Recent Transactions
          </h2>
        </div>

        <div className="space-y-2">
          {fineSummary.transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === "payment"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {tx.type === "payment" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-stone-900">{tx.title}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {tx.bookTitle ? `${tx.bookTitle} • ` : ""}
                    {tx.date}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-black ${
                    tx.type === "payment" ? "text-emerald-600" : "text-stone-900"
                  }`}
                >
                  {tx.type === "payment" ? "- " : "+ "}₹ {tx.amount.toFixed(2)}
                </div>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    tx.status === "paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {tx.status === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pay Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-5 space-y-4 shadow-xl border border-stone-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Library Fine Payment
              </h3>
              <button
                onClick={() => setPayModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-center space-y-1">
              <span className="text-[11px] text-stone-500">Amount to Pay</span>
              <div className="text-2xl font-black text-stone-900">
                ₹ {fineSummary.totalDue.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Select Payment Method
              </label>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("upi")}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedMethod === "upi"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <span>UPI / QR Code (Google Pay, PhonePe)</span>
                  {selectedMethod === "upi" && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("student-account")}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedMethod === "student-account"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <span>Student Library Wallet / Campus Card</span>
                  {selectedMethod === "student-account" && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedMethod === "card"
                      ? "border-blue-600 bg-blue-50/50 text-blue-900"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <span>Debit / Credit Card / NetBanking</span>
                  {selectedMethod === "card" && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Secure 256-bit Encrypted Payment</span>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmPayment}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
            >
              {isProcessing ? "Processing Payment..." : `Authorize ₹ ${fineSummary.totalDue.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const FinesPaymentsView = React.memo(FinesPaymentsViewComponent);

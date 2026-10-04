import React from "react";
import { generateBarcodeSvgPattern } from "../utils/barcode";

interface BarcodeDisplayProps {
  value: string;
  format?: string;
  height?: number;
  showText?: boolean;
  className?: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  format = "CODE128",
  height = 56,
  showText = true,
  className = "",
}) => {
  const pattern = generateBarcodeSvgPattern(value);
  const totalWidth = pattern.reduce((acc, curr) => acc + curr, 0);

  let currentX = 0;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2.5 rounded-lg border border-stone-200 shadow-xs ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[220px] h-12"
        preserveAspectRatio="none"
      >
        {pattern.map((width, idx) => {
          const x = currentX;
          currentX += width;
          // Alternate black and white bars
          if (idx % 2 === 0) {
            return (
              <rect
                key={idx}
                x={x}
                y={0}
                width={width}
                height={height}
                fill="#1c1917"
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <div className="mt-1 font-mono text-[11px] tracking-widest text-stone-700 select-all font-semibold">
          {value}
        </div>
      )}
    </div>
  );
};

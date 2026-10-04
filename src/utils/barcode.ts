/**
 * Helper to generate crisp SVG barcode patterns (Code 128 / EAN simulation)
 */
export function generateBarcodeSvgPattern(code: string): number[] {
  // Simple deterministic pseudo-code bar pattern generator based on char codes
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash << 5) - hash + code.charCodeAt(i);
    hash |= 0;
  }

  const widths: number[] = [2, 1, 2, 1]; // Start guard
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const w1 = (charCode % 3) + 1;
    const w2 = ((charCode * 3) % 4) + 1;
    const w3 = ((charCode * 7) % 3) + 1;
    widths.push(w1, w2, w3, 1);
  }
  widths.push(2, 1, 2, 2); // Stop guard
  return widths;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(dueDateString: string): number {
  const now = new Date().getTime();
  const due = new Date(dueDateString).getTime();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diffDays;
}

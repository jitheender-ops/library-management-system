/**
 * iOS Taptic Engine & Tactile Feedback Simulator using Web Navigator Vibration API.
 * Provides distinct haptic pulses matching iOS Human Interface Guidelines:
 * - selection: subtle crisp 8ms tick for list items, tab switches, segmented pickers, radio/checkboxes
 * - light: standard 14ms tap for buttons, icon triggers, chips
 * - medium: affirmative 22ms feedback for toggles, drawers, modals, affirmative actions
 * - heavy: prominent 36ms thump for destructive or primary financial authorizations
 * - success: celebratory double-pulse [15ms, 45ms, 22ms] for checkouts, payments, completed goals
 * - warning: alert pulse [20ms, 50ms, 20ms] for limits, overdue fines, duplicate holds
 * - error: triple alert pulse [30ms, 40ms, 30ms, 40ms, 30ms] for scan failures or invalid inputs
 */

export type HapticStyle =
  | "selection"
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error";

const HAPTIC_PATTERNS: Record<HapticStyle, number | number[]> = {
  // Ultra-crisp 8ms tick for pickers and list item selection
  selection: 8,
  // Standard 14ms button press tap
  light: 14,
  // 22ms medium feedback for modals and toggles
  medium: 22,
  // 36ms impact for primary authorizations
  heavy: 36,
  // Double-tap pulse [15ms, 45ms pause, 22ms] for successful operations
  success: [15, 45, 22],
  // Warning pulse
  warning: [20, 50, 20],
  // Triple alert pulse
  error: [30, 40, 30, 40, 30],
};

let lastVibrationTime = 0;
const MIN_INTERVAL_MS = 35; // Prevent spamming hardware motor on rapid touch events

/**
 * Triggers a tactile vibration using navigator.vibrate()
 */
export function triggerHaptic(style: HapticStyle = "light"): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  // Verify navigator.vibrate is available
  if (!("vibrate" in navigator) || typeof navigator.vibrate !== "function") {
    return false;
  }

  const now = Date.now();
  if (now - lastVibrationTime < MIN_INTERVAL_MS && (style === "light" || style === "selection")) {
    return false;
  }
  lastVibrationTime = now;

  try {
    const pattern = HAPTIC_PATTERNS[style] ?? 14;
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export const haptic = {
  selection: () => triggerHaptic("selection"),
  light: () => triggerHaptic("light"),
  medium: () => triggerHaptic("medium"),
  heavy: () => triggerHaptic("heavy"),
  success: () => triggerHaptic("success"),
  warning: () => triggerHaptic("warning"),
  error: () => triggerHaptic("error"),
};

/**
 * Attaches delegated touch/pointer listeners across the document to automatically
 * provide tactile feedback for any interactive button, list item, or touchable element.
 */
export function initGlobalHapticFeedback(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  let lastEventTimestamp = 0;
  let lastEventTarget: EventTarget | null = null;

  const processInteractiveFeedback = (target: HTMLElement | null) => {
    if (!target) return;

    // Check if the touched target or any ancestor is an interactive element
    const interactive = target.closest<HTMLElement>(
      'button, [role="button"], [role="tab"], [role="option"], [role="menuitem"], [role="listitem"], [role="radio"], [role="checkbox"], [role="switch"], a[href], input[type="button"], input[type="submit"], input[type="reset"], input[type="radio"], input[type="checkbox"], select, summary, li, tr, [data-haptic], [data-selectable], .list-item, .cursor-pointer'
    );

    if (!interactive) return;

    // Skip disabled elements (iOS standard: no feedback on inert/disabled controls)
    if (
      interactive.hasAttribute("disabled") ||
      interactive.getAttribute("aria-disabled") === "true" ||
      interactive.classList.contains("disabled") ||
      interactive.classList.contains("pointer-events-none")
    ) {
      return;
    }

    const hapticAttr = interactive.getAttribute("data-haptic");
    if (hapticAttr === "none") {
      return;
    }

    // Explicit custom attribute on element
    if (hapticAttr && hapticAttr in HAPTIC_PATTERNS) {
      triggerHaptic(hapticAttr as HapticStyle);
      return;
    }

    // Role-based / semantics detection
    const role = interactive.getAttribute("role");
    const tagName = interactive.tagName.toLowerCase();

    // 1. Switches & Toggles (Medium affirmative impulse)
    if (role === "switch" || interactive.classList.contains("switch") || interactive.classList.contains("toggle")) {
      triggerHaptic("medium");
      return;
    }

    // 2. Destructive buttons (Prominent heavy thump)
    if (
      interactive.classList.contains("bg-rose-600") ||
      interactive.classList.contains("bg-red-600") ||
      interactive.classList.contains("text-rose-600") ||
      interactive.classList.contains("text-red-600")
    ) {
      triggerHaptic("heavy");
      return;
    }

    // 3. List Item Selections & Tab/Segmented options (Subtle crisp selection tick)
    if (
      role === "tab" ||
      role === "option" ||
      role === "listitem" ||
      role === "menuitem" ||
      role === "radio" ||
      role === "checkbox" ||
      tagName === "li" ||
      (tagName === "tr" && interactive.closest("tbody")) ||
      interactive.hasAttribute("data-selectable") ||
      interactive.classList.contains("list-item") ||
      interactive.getAttribute("type") === "radio" ||
      interactive.getAttribute("type") === "checkbox" ||
      (interactive.classList.contains("cursor-pointer") && interactive.closest("ul, ol, [role='list'], [role='tablist'], .space-y-2, .space-y-2\\.5, .space-y-3, .space-y-4, .grid"))
    ) {
      triggerHaptic("selection");
      return;
    }

    // 4. Default to crisp light tap for buttons, links, and general interactive controls
    triggerHaptic("light");
  };

  const handlePointerDown = (event: PointerEvent) => {
    // Only respond to primary touch/click
    if (event.button !== 0 && event.pointerType === "mouse") {
      return;
    }

    const now = Date.now();
    if (now - lastEventTimestamp < 60 && lastEventTarget === event.target) {
      return;
    }
    lastEventTimestamp = now;
    lastEventTarget = event.target;

    processInteractiveFeedback(event.target as HTMLElement | null);
  };

  const handleTouchStart = (event: TouchEvent) => {
    const now = Date.now();
    const touchTarget = event.touches[0]?.target || event.target;
    if (now - lastEventTimestamp < 60 && lastEventTarget === touchTarget) {
      return;
    }
    lastEventTimestamp = now;
    lastEventTarget = touchTarget;

    processInteractiveFeedback(touchTarget as HTMLElement | null);
  };

  // Add passive listeners with capture for immediate response
  document.addEventListener("pointerdown", handlePointerDown, { passive: true, capture: true });
  document.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });

  return () => {
    document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
    document.removeEventListener("touchstart", handleTouchStart, { capture: true });
  };
}

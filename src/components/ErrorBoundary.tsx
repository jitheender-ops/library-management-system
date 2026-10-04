import React from "react";

interface State {
  hasError: boolean;
}

/** Prevents a single component crash from blanking the whole app. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Unhandled UI error:", error);
  }

  private reset = () => {
    // Clear persisted data in case corrupt saved state caused the crash
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith("lms:"))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-stone-50">
        <h1 className="text-lg font-bold text-stone-900">Something went wrong</h1>
        <p className="text-sm text-stone-600 max-w-xs">
          The library portal hit an unexpected error. You can reload, or reset saved data if the problem persists.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
          >
            Reload
          </button>
          <button
            onClick={this.reset}
            className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 text-sm font-semibold"
          >
            Reset data
          </button>
        </div>
      </div>
    );
  }
}

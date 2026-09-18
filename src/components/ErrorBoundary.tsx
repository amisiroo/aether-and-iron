import React from 'react';

interface ErrorBoundaryState { hasError: boolean; }

/** Keeps a production render failure recoverable without exposing state or stack traces. */
export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }

  componentDidCatch(error: Error) {
    // Keep diagnostics out of production UI; development consoles remain useful.
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') console.error('Aether & Iron render error', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <main role="alert" className="min-h-screen bg-[#08090c] text-gray-100 flex items-center justify-center p-6 text-center"><div><h1 className="text-2xl font-bold text-amber-300">The expedition paused unexpectedly.</h1><p className="mt-2 text-gray-400">Reload the page to return to the last autosaved checkpoint.</p><button className="mt-5 rounded border border-amber-500/50 px-4 py-2 text-amber-200" onClick={() => window.location.reload()}>Reload checkpoint</button></div></main>;
  }
}

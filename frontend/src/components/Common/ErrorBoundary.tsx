import { Component, type ErrorInfo, type ReactNode } from "react";
import PageMessage from "./PageMessage";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Shows a way out instead of a blank screen when something on the page crashes.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Something on the page crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <PageMessage>
        <h1 className="text-4xl font-bold sm:text-5xl">Something went wrong</h1>
        <p>This page ran into an unexpected problem. Reloading usually fixes it.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button type="button" className="fancyButton" onClick={() => window.location.reload()}>
            Reload the page
          </button>
          {/* A full page load, so nothing from the crashed page carries over. */}
          <a href="/" className="fancyButton">
            Go to the home page
          </a>
        </div>
      </PageMessage>
    );
  }
}

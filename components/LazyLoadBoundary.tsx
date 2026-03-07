'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LazyLoadBoundaryProps {
  children: ReactNode;
}

interface LazyLoadBoundaryState {
  hasError: boolean;
}

class LazyLoadBoundary extends Component<LazyLoadBoundaryProps, LazyLoadBoundaryState> {
  state: LazyLoadBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): LazyLoadBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('lazy load boundary error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[45vh] w-full items-center justify-center px-4">
          <div className="w-full max-w-md rounded-lg border border-red-500/30 bg-gray-800 p-6 text-center">
            <AlertTriangle className="mx-auto h-5 w-5 text-red-400" />
            <p className="mt-3 text-sm text-gray-200">Unable to load this section right now.</p>
            <Button onClick={this.handleRetry} className="mt-4 bg-violet-500 text-violet-950 hover:bg-violet-400">
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyLoadBoundary;

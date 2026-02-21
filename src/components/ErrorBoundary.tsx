import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.hash = 'home';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-5 bg-stone-50">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning-100 mb-6">
              <AlertTriangle className="w-8 h-8 text-warning-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-3">
              Something Went Wrong
            </h1>
            <p className="text-navy-500 text-sm leading-relaxed mb-8">
              An unexpected error occurred. Please try refreshing the page. If the problem persists, contact us at beehiveassociates@gmail.com.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-800 text-white text-sm font-semibold rounded-lg hover:bg-navy-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

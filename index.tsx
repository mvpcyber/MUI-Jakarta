import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary Class
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <AlertCircle size={32} />
           </div>
           <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
           <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
             Aplikasi mengalami kendala teknis. Mohon muat ulang halaman.
           </p>
           {this.state.error && (
             <pre className="bg-gray-100 p-3 rounded-lg text-[10px] text-left w-full overflow-x-auto mb-6 text-gray-600 border border-gray-200">
                {this.state.error.toString()}
             </pre>
           )}
           <button 
             onClick={() => window.location.reload()}
             className="px-6 py-3 bg-[#00a896] text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform flex items-center"
           >
             <RefreshCw size={16} className="mr-2" /> Muat Ulang
           </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary yakaladı:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans text-[#1e293b]">
          <div className="max-w-md w-full bg-white border border-[#e2e8f0] rounded-[4px] p-6 text-center shadow-xs">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertTriangle size={28} />
            </div>

            <h1 className="text-[18px] font-black text-[#1e293b] mb-2">
              Beklenmeyen Bir Hata Oluştu
            </h1>

            <p className="text-[12.5px] text-[#64748b] leading-relaxed mb-6">
              Sayfa yüklenirken geçici bir aksaklık yaşandı. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
            </p>

            {this.state.error && process.env.NODE_ENV !== 'production' && (
              <div className="mb-5 p-3 bg-gray-50 border border-gray-200 rounded text-left font-mono text-[11px] text-red-700 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-[12.5px] font-bold rounded-[3px] flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <RefreshCw size={15} />
                <span>Sayfayı Yenile</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 border border-[#cbd5e1] hover:bg-slate-50 text-[#475569] text-[12.5px] font-bold rounded-[3px] flex items-center justify-center gap-2 transition-colors"
              >
                <Home size={15} />
                <span>Ana Sayfa</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

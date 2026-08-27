import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NDRS Error Boundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--ndrs-canvas)',
          color: 'var(--ndrs-ink)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: 'var(--ndrs-red-soft)',
            color: 'var(--ndrs-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20
          }}>
            <AlertTriangle size={28} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-title)', marginBottom: 8 }}>
            Application Error
          </h1>
          <p style={{ color: 'var(--ndrs-muted)', fontSize: 14, maxWidth: 440, marginBottom: 24, lineHeight: 1.5 }}>
            A temporary problem occurred while rendering this page. Please refresh to continue.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 14,
              backgroundColor: 'var(--ndrs-blue)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 14px var(--ndrs-glow-blue)'
            }}
          >
            <RefreshCw size={16} />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

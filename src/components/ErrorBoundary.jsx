import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WellSense AI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              W
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              WellSense AI
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              Something went wrong, but don't worry! This is likely a minor issue.
            </p>
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <h3 style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Quick Fixes:
              </h3>
              <ul style={{ 
                color: '#7f1d1d', 
                fontSize: '14px',
                paddingLeft: '1rem',
                lineHeight: '1.4'
              }}>
                <li>Refresh the page (Ctrl+R or Cmd+R)</li>
                <li>Check browser console for errors (F12)</li>
                <li>Ensure Node.js 16+ is installed</li>
                <li>Try running: npm install && npm run dev</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
          <p style={{
            marginTop: '2rem',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            WellSense AI - Empowering healthier lives through intelligent technology
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
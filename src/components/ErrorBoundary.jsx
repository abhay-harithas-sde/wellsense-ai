import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error with context
    console.error('WellSense AI Error:', error, errorInfo);
    
    // Store error info for display
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error tracking service if available
    if (window.errorTracker) {
      window.errorTracker.logError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      const { error, errorCount } = this.state;
      const isRecurringError = errorCount > 2;

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
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: isRecurringError ? '#ef4444' : '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {isRecurringError ? '!' : 'W'}
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              {isRecurringError ? 'Persistent Error Detected' : 'WellSense AI'}
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '1.5rem',
              lineHeight: '1.5',
              fontSize: '14px'
            }}>
              {isRecurringError 
                ? 'We\'re experiencing recurring issues. Please try the solutions below or contact support.'
                : 'Something went wrong, but don\'t worry! This is likely a minor issue.'}
            </p>

            {/* User-friendly error message */}
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
                {isRecurringError ? 'Troubleshooting Steps:' : 'Quick Fixes:'}
              </h3>
              <ul style={{ 
                color: '#7f1d1d', 
                fontSize: '13px',
                paddingLeft: '1.2rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                <li>Refresh the page (Ctrl+R or Cmd+R)</li>
                <li>Clear browser cache and cookies</li>
                {isRecurringError && (
                  <>
                    <li>Check your internet connection</li>
                    <li>Try a different browser</li>
                    <li>Disable browser extensions temporarily</li>
                  </>
                )}
                <li>Check browser console for errors (F12)</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                Refresh Page
              </button>
              {!isRecurringError && (
                <button
                  onClick={this.handleReset}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Try Again
                </button>
              )}
            </div>

            {/* Error details (collapsed by default) */}
            {process.env.NODE_ENV === 'development' && error && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: '#6b7280',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  Technical Details (Development Only)
                </summary>
                <pre style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '11px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  color: '#374151'
                }}>
                  {error.toString()}
                  {this.state.errorInfo && `\n\n${this.state.errorInfo.componentStack}`}
                </pre>
              </details>
            )}
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
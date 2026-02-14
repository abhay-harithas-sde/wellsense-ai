/**
 * Higher-Order Component for adding error boundaries to components
 * 
 * Provides granular error handling for individual components
 * without crashing the entire application.
 * 
 * Requirements: 1.2, 10.3
 */

import React from 'react';

/**
 * Error boundary wrapper component
 */
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in ${this.props.componentName}:`, error, errorInfo);
    
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.75rem',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              !
            </div>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#dc2626',
                margin: 0
              }}>
                {this.props.errorTitle || 'Component Error'}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#7f1d1d',
                margin: '0.25rem 0 0 0'
              }}>
                {this.props.errorMessage || 'This component encountered an error and couldn\'t load.'}
              </p>
            </div>
          </div>
          
          <button
            onClick={this.handleRetry}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Try Again
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{
                cursor: 'pointer',
                color: '#7f1d1d',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                Error Details (Development)
              </summary>
              <pre style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#fff',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                fontSize: '11px',
                overflow: 'auto',
                maxHeight: '150px',
                color: '#7f1d1d'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component that wraps a component with an error boundary
 * 
 * @param {React.Component} Component - Component to wrap
 * @param {Object} options - Error boundary options
 * @param {string} options.componentName - Name of the component for logging
 * @param {string} options.errorTitle - Title for error message
 * @param {string} options.errorMessage - User-friendly error message
 * @param {Function} options.fallback - Custom fallback render function
 * @param {Function} options.onError - Custom error handler
 * @returns {React.Component} Wrapped component
 */
export function withErrorBoundary(Component, options = {}) {
  const {
    componentName = Component.displayName || Component.name || 'Component',
    errorTitle,
    errorMessage,
    fallback,
    onError
  } = options;

  const WrappedComponent = React.forwardRef((props, ref) => (
    <ComponentErrorBoundary
      componentName={componentName}
      errorTitle={errorTitle}
      errorMessage={errorMessage}
      fallback={fallback}
      onError={onError}
    >
      <Component {...props} ref={ref} />
    </ComponentErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${componentName})`;

  return WrappedComponent;
}

/**
 * Custom fallback components for common scenarios
 */
export const ErrorFallbacks = {
  /**
   * Fallback for data loading errors
   */
  DataLoadError: (error, retry) => (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '1rem'
      }}>
        📊
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem'
      }}>
        Unable to Load Data
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '1.5rem'
      }}>
        We couldn't load the data for this section. Please try again.
      </p>
      <button
        onClick={retry}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    </div>
  ),

  /**
   * Fallback for API errors
   */
  ApiError: (error, retry) => (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
      border: '1px solid #fecaca'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '1rem'
      }}>
        🔌
      </div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#dc2626',
        marginBottom: '0.5rem'
      }}>
        Connection Error
      </h3>
      <p style={{
        fontSize: '14px',
        color: '#7f1d1d',
        marginBottom: '1.5rem'
      }}>
        We're having trouble connecting to our services. Please check your connection and try again.
      </p>
      <button
        onClick={retry}
        style={{
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        Retry Connection
      </button>
    </div>
  ),

  /**
   * Minimal fallback for small components
   */
  Minimal: (error, retry) => (
    <div style={{
      padding: '1rem',
      backgroundColor: '#fef2f2',
      borderRadius: '6px',
      border: '1px solid #fecaca',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span style={{ fontSize: '14px', color: '#7f1d1d' }}>
        Failed to load
      </span>
      <button
        onClick={retry}
        style={{
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          fontSize: '13px',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    </div>
  )
};

export default withErrorBoundary;

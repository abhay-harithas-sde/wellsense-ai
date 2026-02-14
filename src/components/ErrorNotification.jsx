/**
 * Error Notification Component
 * 
 * Displays user-friendly error messages with retry functionality
 * 
 * Requirements: 1.2, 10.3
 */

import React, { useState, useEffect } from 'react';

/**
 * Error notification component
 * 
 * @param {Object} props - Component props
 * @param {Error} props.error - Error object
 * @param {string} props.message - Custom error message
 * @param {Function} props.onRetry - Retry callback
 * @param {Function} props.onDismiss - Dismiss callback
 * @param {number} props.autoHideDuration - Auto-hide duration in ms (0 = no auto-hide)
 * @param {string} props.severity - Severity level: 'error', 'warning', 'info'
 */
export function ErrorNotification({
  error,
  message,
  onRetry,
  onDismiss,
  autoHideDuration = 0,
  severity = 'error'
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  if (!visible) {
    return null;
  }

  const displayMessage = message || error?.userMessage || error?.message || 'An error occurred';

  const colors = {
    error: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#7f1d1d',
      icon: '#ef4444',
      button: '#ef4444'
    },
    warning: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#78350f',
      icon: '#f59e0b',
      button: '#f59e0b'
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1e3a8a',
      icon: '#3b82f6',
      button: '#3b82f6'
    }
  };

  const color = colors[severity] || colors.error;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        maxWidth: '400px',
        backgroundColor: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: color.icon,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem',
            flexShrink: 0,
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}
        >
          {severity === 'error' ? '!' : severity === 'warning' ? '⚠' : 'ℹ'}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '14px',
              color: color.text,
              margin: 0,
              lineHeight: '1.5',
              wordBreak: 'break-word'
            }}
          >
            {displayMessage}
          </p>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '0.75rem'
            }}
          >
            {onRetry && (
              <button
                onClick={handleRetry}
                style={{
                  backgroundColor: color.button,
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => (e.target.style.opacity = '0.9')}
                onMouseOut={(e) => (e.target.style.opacity = '1')}
              >
                Retry
              </button>
            )}
            <button
              onClick={handleDismiss}
              style={{
                backgroundColor: 'transparent',
                color: color.text,
                border: `1px solid ${color.border}`,
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = 'rgba(0,0,0,0.05)')}
              onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: color.text,
            cursor: 'pointer',
            padding: '0.25rem',
            marginLeft: '0.5rem',
            fontSize: '18px',
            lineHeight: 1,
            opacity: 0.6,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => (e.target.style.opacity = '1')}
          onMouseOut={(e) => (e.target.style.opacity = '0.6')}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Error notification manager hook
 * 
 * @returns {Object} Notification state and methods
 */
export function useErrorNotification() {
  const [notification, setNotification] = useState(null);

  const showError = (error, options = {}) => {
    setNotification({
      error,
      message: options.message,
      onRetry: options.onRetry,
      severity: 'error',
      autoHideDuration: options.autoHideDuration || 0
    });
  };

  const showWarning = (message, options = {}) => {
    setNotification({
      message,
      onRetry: options.onRetry,
      severity: 'warning',
      autoHideDuration: options.autoHideDuration || 5000
    });
  };

  const showInfo = (message, options = {}) => {
    setNotification({
      message,
      severity: 'info',
      autoHideDuration: options.autoHideDuration || 5000
    });
  };

  const dismiss = () => {
    setNotification(null);
  };

  return {
    notification,
    showError,
    showWarning,
    showInfo,
    dismiss,
    ErrorNotificationComponent: notification ? (
      <ErrorNotification
        {...notification}
        onDismiss={dismiss}
      />
    ) : null
  };
}

export default ErrorNotification;

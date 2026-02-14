/**
 * Error Handling Examples and Best Practices
 * 
 * This file demonstrates how to use the error handling utilities
 * implemented for graceful error handling of external services.
 * 
 * Requirements: 1.2, 10.3
 */

/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import { withErrorBoundary, ErrorFallbacks } from '../components/withErrorBoundary';
import { useAsyncWithError } from '../hooks/useAsyncWithError';
import { useErrorNotification } from '../components/ErrorNotification';
import apiWithRetry from '../services/apiWithRetry';
import { retryWithBackoff, getUserFriendlyErrorMessage } from './retryWithBackoff';

// ============================================================================
// Example 1: Using Error Boundary HOC
// ============================================================================

// Wrap a component that might throw errors
const RiskyComponent = () => {
  // Component that might fail
  return <div>Content that might error</div>;
};

// Wrap with error boundary
const SafeRiskyComponent = withErrorBoundary(RiskyComponent, {
  componentName: 'RiskyComponent',
  errorTitle: 'Component Failed',
  errorMessage: 'This component encountered an error. Please try again.',
  onError: (error, errorInfo) => {
    console.error('RiskyComponent error:', error);
  }
});

// Usage in parent component
function ParentComponent() {
  return (
    <div>
      <SafeRiskyComponent />
    </div>
  );
}

// ============================================================================
// Example 2: Using Custom Error Fallback
// ============================================================================

const DataDisplayComponent = () => {
  // Component that displays data
  return <div>Data display</div>;
};

// Wrap with custom fallback
const SafeDataDisplay = withErrorBoundary(DataDisplayComponent, {
  componentName: 'DataDisplay',
  fallback: ErrorFallbacks.DataLoadError
});

// ============================================================================
// Example 3: Using useAsyncWithError Hook
// ============================================================================

function HealthDataComponent() {
  const {
    data,
    error,
    userMessage,
    isLoading,
    isError,
    execute,
    retry
  } = useAsyncWithError(
    async () => {
      return await apiWithRetry.getHealthRecords();
    },
    {
      immediate: true, // Execute on mount
      context: 'loading health records',
      onSuccess: (data) => {
        console.log('Health records loaded:', data);
      },
      onError: (error, userMessage) => {
        console.error('Failed to load health records:', error);
      }
    }
  );

  if (isLoading) {
    return <div>Loading health records...</div>;
  }

  if (isError) {
    return (
      <div>
        <p>{userMessage}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* Display health records */}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

// ============================================================================
// Example 4: Using Error Notifications
// ============================================================================

function FormComponent() {
  const { notification, showError, showWarning, ErrorNotificationComponent } = useErrorNotification();
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiWithRetry.createHealthRecord(formData);
      // Success handling
    } catch (error) {
      showError(error, {
        onRetry: () => handleSubmit(e),
        autoHideDuration: 0 // Don't auto-hide errors
      });
    }
  };

  return (
    <div>
      {ErrorNotificationComponent}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

// ============================================================================
// Example 5: Manual Retry Logic
// ============================================================================

async function fetchDataWithRetry() {
  try {
    const data = await retryWithBackoff(
      async () => {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        onRetry: (attempt, maxRetries, delay, error) => {
          console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
        }
      }
    );

    return data;
  } catch (error) {
    const userMessage = getUserFriendlyErrorMessage(error, 'fetching data');
    console.error(userMessage);
    throw error;
  }
}

// ============================================================================
// Example 6: Using API Service with Retry
// ============================================================================

async function loadDashboardData() {
  try {
    // API service automatically retries on failure
    const data = await apiWithRetry.getDashboardData();
    return data;
  } catch (error) {
    // Error already has user-friendly message
    console.error(error.userMessage);
    throw error;
  }
}

// ============================================================================
// Example 7: Combining Multiple Patterns
// ============================================================================

const DashboardComponent = () => {
  const { notification, showError, ErrorNotificationComponent } = useErrorNotification();
  
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    userMessage: dashboardError,
    retry: retryDashboard
  } = useAsyncWithError(
    () => apiWithRetry.getDashboardData(),
    {
      immediate: true,
      context: 'loading dashboard',
      onError: (error, userMessage) => {
        showError(error, {
          onRetry: retryDashboard
        });
      }
    }
  );

  const {
    data: healthData,
    isLoading: isHealthLoading,
    execute: loadHealthData
  } = useAsyncWithError(
    () => apiWithRetry.getHealthRecords(),
    {
      context: 'loading health data'
    }
  );

  if (isDashboardLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      {ErrorNotificationComponent}
      
      {isDashboardError && (
        <div>
          <p>{dashboardError}</p>
          <button onClick={retryDashboard}>Retry</button>
        </div>
      )}

      {dashboardData && (
        <div>
          {/* Display dashboard */}
          <button onClick={loadHealthData} disabled={isHealthLoading}>
            {isHealthLoading ? 'Loading...' : 'Load Health Data'}
          </button>
        </div>
      )}
    </div>
  );
};

// Wrap entire dashboard with error boundary
const SafeDashboard = withErrorBoundary(DashboardComponent, {
  componentName: 'Dashboard',
  fallback: ErrorFallbacks.DataLoadError
});

// ============================================================================
// Example 8: Error Handling in Event Handlers
// ============================================================================

function ChatComponent() {
  const [message, setMessage] = useState('');
  const { showError, ErrorNotificationComponent } = useErrorNotification();

  const handleSendMessage = async () => {
    try {
      await apiWithRetry.sendMessage('session-id', message);
      setMessage('');
    } catch (error) {
      // Show error notification with retry
      showError(error, {
        onRetry: handleSendMessage,
        message: 'Failed to send message. Please try again.'
      });
    }
  };

  return (
    <div>
      {ErrorNotificationComponent}
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}

// ============================================================================
// Best Practices Summary
// ============================================================================

/*
1. Use Error Boundaries for Component-Level Errors:
   - Wrap components that might throw errors
   - Provide custom fallback UI
   - Use withErrorBoundary HOC for easy wrapping

2. Use useAsyncWithError for Data Fetching:
   - Handles loading, error, and success states
   - Provides retry functionality
   - Automatically generates user-friendly messages

3. Use apiWithRetry for API Calls:
   - Automatic retry with exponential backoff
   - User-friendly error messages
   - Graceful degradation

4. Use Error Notifications for User Feedback:
   - Show errors without blocking UI
   - Provide retry actions
   - Auto-dismiss for non-critical errors

5. Always Provide Context:
   - Use descriptive context strings
   - Help users understand what went wrong
   - Provide actionable solutions

6. Handle Errors at Multiple Levels:
   - Component level (Error Boundaries)
   - Hook level (useAsyncWithError)
   - Service level (apiWithRetry)
   - Manual level (try/catch with retryWithBackoff)

7. Test Error Scenarios:
   - Network failures
   - Timeout errors
   - Server errors (5xx)
   - Rate limiting (429)
   - Authentication errors (401)
*/

export {
  SafeRiskyComponent,
  SafeDataDisplay,
  HealthDataComponent,
  FormComponent,
  SafeDashboard,
  ChatComponent,
  fetchDataWithRetry,
  loadDashboardData
};

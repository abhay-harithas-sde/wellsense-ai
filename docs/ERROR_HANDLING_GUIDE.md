# Error Handling Guide

## Overview

This guide documents the graceful error handling implementation for external services in the WellSense AI Platform. The implementation ensures a reliable demo experience by handling errors gracefully, providing user-friendly messages, and implementing automatic retry logic with exponential backoff.

**Requirements Addressed:** 1.2, 10.3

## Architecture

The error handling system consists of four layers:

1. **Component Level**: Error boundaries catch React component errors
2. **Hook Level**: Custom hooks manage async operations with error handling
3. **Service Level**: API services with automatic retry logic
4. **Utility Level**: Reusable error handling utilities

## Components

### 1. Error Boundaries

#### Enhanced ErrorBoundary Component
Location: `src/components/ErrorBoundary.jsx`

The root error boundary catches all unhandled errors in the React component tree.

**Features:**
- Tracks error count to detect recurring errors
- Provides user-friendly error messages
- Offers retry and reload options
- Shows technical details in development mode
- Logs errors for debugging

**Usage:**
```jsx
// Already implemented in src/main.jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

#### withErrorBoundary HOC
Location: `src/components/withErrorBoundary.jsx`

Higher-order component for adding error boundaries to specific components.

**Features:**
- Granular error handling per component
- Custom fallback UI
- Retry functionality
- Prevents entire app crash

**Usage:**
```jsx
import { withErrorBoundary, ErrorFallbacks } from './components/withErrorBoundary';

const MyComponent = () => {
  // Component code
};

export default withErrorBoundary(MyComponent, {
  componentName: 'MyComponent',
  errorTitle: 'Failed to Load',
  errorMessage: 'This section couldn\'t load. Please try again.',
  fallback: ErrorFallbacks.DataLoadError
});
```

**Available Fallbacks:**
- `ErrorFallbacks.DataLoadError` - For data loading failures
- `ErrorFallbacks.ApiError` - For API connection errors
- `ErrorFallbacks.Minimal` - For small components

### 2. Retry Logic

#### retryWithBackoff Utility
Location: `src/utils/retryWithBackoff.js`

Implements exponential backoff retry logic for external service calls.

**Features:**
- Configurable max retries (default: 3)
- Exponential backoff with jitter
- Timeout support per attempt
- Conditional retry based on error type
- User-friendly error messages

**Usage:**
```javascript
import { retryWithBackoff } from './utils/retryWithBackoff';

const data = await retryWithBackoff(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    timeout: 30000,
    onRetry: (attempt, maxRetries, delay, error) => {
      console.log(`Retry ${attempt}/${maxRetries} in ${delay}ms`);
    }
  }
);
```

**Retry Strategy:**
- Attempt 1: Immediate
- Attempt 2: ~1 second delay
- Attempt 3: ~2 second delay
- Attempt 4: ~4 second delay (if maxRetries > 3)

**Errors That Trigger Retry:**
- Network errors (ECONNREFUSED, ETIMEDOUT)
- Timeout errors
- Server errors (5xx)
- Rate limiting (429)
- Request timeout (408)

**Errors That Don't Retry:**
- Client errors (4xx except 408, 429)
- Authentication errors (401)
- Permission errors (403)
- Not found errors (404)

### 3. API Service with Retry

#### apiWithRetry Service
Location: `src/services/apiWithRetry.js`

Wraps the existing API service with automatic retry logic.

**Features:**
- Automatic retry for all API calls
- Context-aware error messages
- Configurable retry options per method
- Graceful degradation

**Usage:**
```javascript
import apiWithRetry from './services/apiWithRetry';

// Automatically retries on failure
try {
  const data = await apiWithRetry.getDashboardData();
  // Handle success
} catch (error) {
  // Error has user-friendly message
  console.error(error.userMessage);
}
```

**Retry Configuration by Method:**
- Auth methods: 1-2 retries (faster failure for auth)
- Data methods: 3 retries (standard)
- Chat/AI methods: 2 retries with 15s timeout
- Upload methods: 2 retries with 30-60s timeout

### 4. React Hooks

#### useAsyncWithError Hook
Location: `src/hooks/useAsyncWithError.js`

React hook for handling async operations with error handling.

**Features:**
- Loading, error, and success states
- Automatic cleanup on unmount
- Retry functionality
- User-friendly error messages
- Success/error callbacks

**Usage:**
```jsx
import { useAsyncWithError } from './hooks/useAsyncWithError';

function MyComponent() {
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
      immediate: true,
      context: 'loading health records',
      onSuccess: (data) => console.log('Success:', data),
      onError: (error, msg) => console.error('Error:', msg)
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{userMessage} <button onClick={retry}>Retry</button></div>;
  return <div>{/* Display data */}</div>;
}
```

#### useErrorNotification Hook
Location: `src/components/ErrorNotification.jsx`

Hook for displaying error notifications.

**Features:**
- Non-blocking error display
- Retry actions
- Auto-dismiss for warnings/info
- Multiple severity levels

**Usage:**
```jsx
import { useErrorNotification } from './components/ErrorNotification';

function MyComponent() {
  const { showError, showWarning, ErrorNotificationComponent } = useErrorNotification();

  const handleAction = async () => {
    try {
      await apiWithRetry.someAction();
    } catch (error) {
      showError(error, {
        onRetry: handleAction,
        autoHideDuration: 0 // Don't auto-hide
      });
    }
  };

  return (
    <div>
      {ErrorNotificationComponent}
      <button onClick={handleAction}>Do Action</button>
    </div>
  );
}
```

## User-Friendly Error Messages

The system automatically converts technical errors into user-friendly messages:

| Error Type | User Message |
|------------|--------------|
| Network error | "Unable to connect to the server. Please check your internet connection." |
| Timeout | "The request took too long. Please try again." |
| Rate limit (429) | "Too many requests. Please wait a moment before trying again." |
| Auth error (401) | "Your session has expired. Please log in again." |
| Permission (403) | "You don't have permission to perform this action." |
| Not found (404) | "The requested resource was not found." |
| Server error (5xx) | "The server encountered an error. Please try again later." |
| Validation (400) | "Invalid data provided. Please check your input." |

## Best Practices

### 1. Always Use Error Boundaries

Wrap components that might fail:

```jsx
import { withErrorBoundary } from './components/withErrorBoundary';

const MyComponent = () => {
  // Component that might throw errors
};

export default withErrorBoundary(MyComponent, {
  componentName: 'MyComponent',
  errorMessage: 'This section failed to load.'
});
```

### 2. Use apiWithRetry for API Calls

Replace direct API calls with retry-enabled versions:

```javascript
// ❌ Don't do this
import apiService from './services/api';
const data = await apiService.getData();

// ✅ Do this
import apiWithRetry from './services/apiWithRetry';
const data = await apiWithRetry.getData();
```

### 3. Provide Context for Errors

Always provide context when handling errors:

```javascript
const { execute } = useAsyncWithError(
  fetchData,
  {
    context: 'loading your health records' // Specific context
  }
);
```

### 4. Handle Errors at Multiple Levels

Implement defense in depth:

```jsx
// Level 1: Error Boundary
const SafeComponent = withErrorBoundary(MyComponent);

// Level 2: Hook-level error handling
function MyComponent() {
  const { data, error, retry } = useAsyncWithError(fetchData);
  
  // Level 3: Manual error handling
  const handleAction = async () => {
    try {
      await apiWithRetry.action();
    } catch (error) {
      // Handle specific error
    }
  };
}
```

### 5. Show Errors Without Blocking

Use notifications for non-critical errors:

```jsx
const { showError, ErrorNotificationComponent } = useErrorNotification();

// Show error without blocking UI
showError(error, { onRetry: handleRetry });
```

### 6. Test Error Scenarios

Test common error scenarios:
- Network disconnection
- Slow connections (timeout)
- Server errors (5xx)
- Rate limiting (429)
- Authentication expiry (401)

## Integration with Existing Code

### OpenAI Fallback Integration

The error handling system works seamlessly with the existing OpenAI fallback mechanism:

```javascript
// lib/openai-fallback.js already implements retry logic
// The new error handling enhances it with user-friendly messages

import { callOpenAIWithFallback } from './lib/openai-fallback';
import { getUserFriendlyErrorMessage } from './utils/retryWithBackoff';

try {
  const response = await callOpenAIWithFallback(prompt, { openai });
} catch (error) {
  const userMessage = getUserFriendlyErrorMessage(error, 'getting AI response');
  // Show user-friendly message
}
```

### Middleware Integration

The backend error handler middleware (`middleware/errorHandler.js`) already provides structured error responses. The frontend error handling enhances this by:

1. Retrying transient errors automatically
2. Converting error responses to user-friendly messages
3. Providing retry actions in the UI

## Monitoring and Debugging

### Development Mode

In development, error boundaries show technical details:

```jsx
{process.env.NODE_ENV === 'development' && (
  <details>
    <summary>Error Details</summary>
    <pre>{error.stack}</pre>
  </details>
)}
```

### Error Logging

All errors are logged with context:

```javascript
console.error('[API Error] loading health records:', error);
```

### Error Tracking

The system supports external error tracking:

```javascript
// In ErrorBoundary.jsx
if (window.errorTracker) {
  window.errorTracker.logError(error, errorInfo);
}
```

## Demo Day Considerations

For demo day reliability:

1. **Automatic Retry**: All API calls retry automatically (3 attempts)
2. **Fallback Responses**: OpenAI calls fall back to cached responses
3. **User-Friendly Messages**: Technical errors converted to friendly messages
4. **Non-Blocking Errors**: Errors don't crash the entire app
5. **Quick Recovery**: Retry buttons allow quick recovery

## Testing

### Manual Testing

Test error scenarios:

```javascript
// Simulate network error
window.fetch = () => Promise.reject(new Error('Network error'));

// Simulate timeout
window.fetch = () => new Promise(() => {}); // Never resolves

// Simulate server error
window.fetch = () => Promise.resolve({ ok: false, status: 500 });
```

### Automated Testing

See `src/utils/errorHandlingExamples.js` for usage examples.

## Troubleshooting

### Error: "Too many retries"

**Cause**: Service is consistently failing
**Solution**: Check backend service health, network connection

### Error: "Request timeout"

**Cause**: Request taking too long
**Solution**: Increase timeout in retry options, check backend performance

### Error Boundary Not Catching Errors

**Cause**: Error in event handler or async code
**Solution**: Use try/catch in event handlers, use useAsyncWithError for async operations

## Future Enhancements

Potential improvements:

1. **Circuit Breaker**: Stop retrying after repeated failures
2. **Offline Mode**: Full offline functionality with service workers
3. **Error Analytics**: Track error patterns and frequencies
4. **Smart Retry**: Adjust retry strategy based on error patterns
5. **Progressive Enhancement**: Degrade features gracefully

## References

- Requirements: 1.2 (Input Validation Error Messages), 10.3 (Edge Case Handling)
- Design Document: Error Handling section
- OpenAI Fallback: `lib/openai-fallback.js`
- Backend Error Handler: `middleware/errorHandler.js`

/**
 * React Hook for Async Operations with Error Handling
 * 
 * Provides a consistent way to handle async operations with:
 * - Loading states
 * - Error handling
 * - Retry functionality
 * - User-friendly error messages
 * 
 * Requirements: 1.2, 10.3
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getUserFriendlyErrorMessage } from '../utils/retryWithBackoff';

/**
 * Hook for handling async operations with error handling
 * 
 * @param {Function} asyncFunction - Async function to execute
 * @param {Object} options - Hook options
 * @param {boolean} options.immediate - Execute immediately on mount
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {string} options.context - Context for error messages
 * @returns {Object} Hook state and methods
 */
export function useAsyncWithError(asyncFunction, options = {}) {
  const {
    immediate = false,
    onSuccess,
    onError,
    context = 'completing your request'
  } = options;

  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null,
    userMessage: null
  });

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Execute the async function
   */
  const execute = useCallback(async (...args) => {
    // Abort previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState({
      loading: true,
      data: null,
      error: null,
      userMessage: null
    });

    try {
      const result = await asyncFunction(...args);
      
      if (isMountedRef.current) {
        setState({
          loading: false,
          data: result,
          error: null,
          userMessage: null
        });

        if (onSuccess) {
          onSuccess(result);
        }
      }

      return result;

    } catch (error) {
      if (isMountedRef.current) {
        const userMessage = error.userMessage || getUserFriendlyErrorMessage(error, context);
        
        setState({
          loading: false,
          data: null,
          error,
          userMessage
        });

        if (onError) {
          onError(error, userMessage);
        }
      }

      throw error;
    }
  }, [asyncFunction, onSuccess, onError, context]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      data: null,
      error: null,
      userMessage: null
    });
  }, []);

  /**
   * Retry the last execution
   */
  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== null
  };
}

/**
 * Hook for handling multiple async operations
 * 
 * @param {Object} asyncFunctions - Object of async functions
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods for each function
 */
export function useMultipleAsync(asyncFunctions, options = {}) {
  const [states, setStates] = useState(() => {
    const initial = {};
    Object.keys(asyncFunctions).forEach(key => {
      initial[key] = {
        loading: false,
        data: null,
        error: null,
        userMessage: null
      };
    });
    return initial;
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const createExecutor = useCallback((key, asyncFn, context) => {
    return async (...args) => {
      setStates(prev => ({
        ...prev,
        [key]: {
          loading: true,
          data: null,
          error: null,
          userMessage: null
        }
      }));

      try {
        const result = await asyncFn(...args);
        
        if (isMountedRef.current) {
          setStates(prev => ({
            ...prev,
            [key]: {
              loading: false,
              data: result,
              error: null,
              userMessage: null
            }
          }));
        }

        return result;

      } catch (error) {
        if (isMountedRef.current) {
          const userMessage = error.userMessage || getUserFriendlyErrorMessage(error, context);
          
          setStates(prev => ({
            ...prev,
            [key]: {
              loading: false,
              data: null,
              error,
              userMessage
            }
          }));
        }

        throw error;
      }
    };
  }, []);

  const executors = {};
  Object.entries(asyncFunctions).forEach(([key, asyncFn]) => {
    const context = options[key]?.context || `executing ${key}`;
    executors[key] = createExecutor(key, asyncFn, context);
  });

  return {
    states,
    executors,
    isAnyLoading: Object.values(states).some(s => s.loading),
    hasAnyError: Object.values(states).some(s => s.error)
  };
}

/**
 * Hook for polling with error handling
 * 
 * @param {Function} asyncFunction - Async function to poll
 * @param {number} interval - Polling interval in ms
 * @param {Object} options - Hook options
 * @returns {Object} Hook state and methods
 */
export function usePollingWithError(asyncFunction, interval = 5000, options = {}) {
  const {
    enabled = true,
    onSuccess,
    onError,
    context = 'fetching updates'
  } = options;

  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null,
    userMessage: null
  });

  const isMountedRef = useRef(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const poll = useCallback(async () => {
    try {
      const result = await asyncFunction();
      
      if (isMountedRef.current) {
        setState({
          loading: false,
          data: result,
          error: null,
          userMessage: null
        });

        if (onSuccess) {
          onSuccess(result);
        }
      }

    } catch (error) {
      if (isMountedRef.current) {
        const userMessage = error.userMessage || getUserFriendlyErrorMessage(error, context);
        
        setState({
          loading: false,
          data: null,
          error,
          userMessage
        });

        if (onError) {
          onError(error, userMessage);
        }
      }
    }
  }, [asyncFunction, onSuccess, onError, context]);

  useEffect(() => {
    if (enabled) {
      // Initial poll
      poll();

      // Set up interval
      intervalRef.current = setInterval(poll, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enabled, interval, poll]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!intervalRef.current && enabled) {
      poll();
      intervalRef.current = setInterval(poll, interval);
    }
  }, [enabled, interval, poll]);

  return {
    ...state,
    stop,
    start,
    refresh: poll
  };
}

export default useAsyncWithError;

/**
 * Unified Error Management System
 * Single entry point for all error handling functionality
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  AppError,
  ErrorHandlerConfig,
  ErrorRegistryEntry,
  ErrorBoundaryProps,
  ErrorDisplayProps,
} from "./types/types";

export { ErrorCategory, ErrorSeverity, ErrorUIState } from "./types/types";

// ============================================================================
// REGISTRY EXPORTS
// ============================================================================

export { ERROR_REGISTRY } from "./core/registry";

// ============================================================================
// HANDLER EXPORTS
// ============================================================================

export { errorHandler } from "./core/handler";

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export {
  createError,
  handleError,
  withErrorHandling,
  handleUnknownError,
  getErrorMessage,
  getErrorSeverityClass,
  getErrorUIState,
  shouldShowRetry,
  isCriticalError,
  formatErrorForLogging,
} from "./utils/utils";

// ============================================================================
// HOOK EXPORTS
// ============================================================================

export {
  useErrorHandler,
  useErrorReset,
  useGlobalErrorListener,
} from "./hooks/Hook";

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { default as ErrorBoundary } from "./components/ErrorBoundary";
export { ErrorDisplay } from "./components/ErrorDisplay";

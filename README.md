# Unified Error Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/)

A consolidated, high-resilience error handling module for modern React applications. This system provides a **Single Source of Truth** for managing UI states, logging, and recovery logic across the entire application stack.

---

## Architecture

### Module Structure

The system is modularized to ensure that logic, types, and UI components remain decoupled yet highly cohesive.

src/lib/errors/
├── index.ts # Central entry point (Barrel Export)
├── types.ts # TypeScript interfaces & Error schemas
├── registry.ts # Error code definitions & UI mapping
├── handler.ts # The "Engine": Global listeners & processing logic
├── hooks.ts # React integration (useErrorHandler, useErrorReset)
├── ErrorBoundary.tsx # Catch-all component for React render errors
└── ErrorDisplay.tsx # Presentation layer for various error states

### Key Capabilities

- **Universal Catching**: Handles React lifecycle crashes AND unhandled `Promise` rejections.
- **Intelligent Recovery**: Built-in retry mechanisms with exponential backoff.
- **Declarative UI**: Map any Error Code to a specific UI behavior (Toast, Modal, Full Page).

---

## Error Mapping & UI States

The **Registry** defines how the application reacts to specific failures:

| Error Code             | Category | Severity     | UI State     | Retry | User Action       |
| ---------------------- | -------- | ------------ | ------------ | ----- | ----------------- |
| `NETWORK_TIMEOUT`      | NETWORK  | **WARNING**  | Inline Alert | ✅    | "Try Again"       |
| `NETWORK_OFFLINE`      | NETWORK  | **ERROR**    | Full Page    | ✅    | Check Connection  |
| `AUTH_UNAUTHORIZED`    | AUTH     | **ERROR**    | Full Page    | ❌    | Redirect to Login |
| `AUTH_SESSION_EXPIRED` | AUTH     | **WARNING**  | Modal        | ✅    | Re-authenticate   |
| `CONVEX_MUTATION`      | CONVEX   | **ERROR**    | Toast        | ✅    | Auto-retry (3x)   |
| `UNKNOWN_ERROR`        | UNKNOWN  | **CRITICAL** | Full Page    | ✅    | "Report Issue"    |

---

## Implementation

### 1. Global Provider Setup

Wrap your application root to catch rendering errors and initialize global listeners.

```
import { errorHandler, ErrorBoundary } from "@/lib/errors";

// Configure global behavior
errorHandler.config = {
  logErrors: process.env.NODE_ENV === "development",
  onError: (error) => {
    // Integration point for Sentry, LogRocket, etc.
    console.error(`[App Error]: ${error.code}`, error.metadata);
  },
};

export default function RootLayout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

```

### 2. High-Order Error Handling

Wrap asynchronous logic to automatically trigger the UI state mapping.

```
import { withErrorHandling } from "@/lib/errors";

const saveSettings = async (data: Settings) => {
  return await withErrorHandling(
    async () => {
      const result = await api.updateSettings(data);
      return result;
    },
    "NETWORK_SERVER_ERROR",
    { section: 'settings' } // Context for debugging
  );
};

```

### 3. Using the Hooks

For fine-grained control within components.

```
import { useErrorHandler, useErrorReset } from "@/lib/errors";

function ProfileForm() {
  const { handleError } = useErrorHandler();
  const { retry, canRetry } = useErrorReset(3);

  const onSubmit = async () => {
    try {
      await updateProfile();
    } catch (err) {
      handleError(err, "VALIDATION_REQUIRED");
    }
  };
}

```

---

## Severity Levels

| Level        | UI Color | Log Method      | Impact                             |
| ------------ | -------- | --------------- | ---------------------------------- |
| **INFO**     | Blue     | `console.info`  | Low: Informational only.           |
| **WARNING**  | Yellow   | `console.warn`  | Medium: Feature degraded.          |
| **ERROR**    | Red      | `console.warn`  | High: Specific feature is broken.  |
| **CRITICAL** | Purple   | `console.error` | Fatal: Application cannot proceed. |

---

## Migration Guide

To maintain a **Single Source of Truth**, the following legacy patterns must be removed:

1. **Refactor Imports**: Update `@/lib/errorHandler` → `@/lib/errors`.
2. **Delete Deprecated Files**:

- `src/lib/errorHandler.ts`
- `src/components/common/ErrorBoundary.tsx`
- `src/components/common/ErrorDisplay.tsx`

---

## Best Practices

- **Registry First**: Never throw raw strings. Define a code in `registry.ts` first.
- **Metadata**: Always include context (e.g., `userId`, `endpoint`) to make logs actionable.
- **Reset Strategies**: Always provide a "Retry" path to prevent users from getting stuck.

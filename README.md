````markdown
# Unified Error Management System

## Overview

The unified error management system consolidates all error handling logic into a single, scalable module. This system provides a **Single Source of Truth** for error handling across the entire application, supporting both React lifecycle errors and uncaught Promise/Network errors.

---

## Architecture

### Module Structure

All core logic resides in `src/lib/errors/` to ensure high cohesion and easy maintenance.

```text
src/lib/errors/
├── index.ts              # Barrel export (single entry point)
├── types.ts              # Type definitions and interfaces
├── registry.ts           # Error code registry
├── handler.ts            # Core error handler service
├── utils.ts              # Utility functions
├── hooks.ts              # React hooks
├── ErrorBoundary.tsx     # React Error Boundary component
└── ErrorDisplay.tsx      # Error display UI component
```
````

### Key Features

- **Single Source of Truth** - All error logic centralized.
- **Global Error Handling** - Catches React errors + unhandled Promise rejections.
- **Retry Mechanisms** - Built-in retry with exponential backoff.
- **Error Type → UI State Mapping** - Clear mapping from errors to UI presentation.
- **Resilience** - Reset/retry without full page refresh.
- **Type Safety** - Full TypeScript support.

---

## 📊 Error Type to UI State Mapping

| Error Code             | Category   | Severity | UI State       | Retry | User Action                  |
| ---------------------- | ---------- | -------- | -------------- | ----- | ---------------------------- |
| `NETWORK_TIMEOUT`      | NETWORK    | WARNING  | Inline Warning | ✅    | "Try Again" button           |
| `NETWORK_OFFLINE`      | NETWORK    | ERROR    | Full Page      | ✅    | "Check Connection" + "Retry" |
| `NETWORK_SERVER_ERROR` | NETWORK    | ERROR    | Full Page      | ✅    | "Try Again" button           |
| `AUTH_UNAUTHORIZED`    | AUTH       | ERROR    | Full Page      | ❌    | "Sign In" redirect           |
| `AUTH_FORBIDDEN`       | AUTH       | ERROR    | Full Page      | ❌    | "Contact Support"            |
| `AUTH_SESSION_EXPIRED` | AUTH       | WARNING  | Modal          | ✅    | "Sign In Again"              |
| `VALIDATION_REQUIRED`  | VALIDATION | INFO     | Inline Info    | ✅    | Form highlight               |
| `STREAM_CONN_FAILED`   | STREAM     | ERROR    | Full Page      | ✅    | "Retry Connection"           |
| `STREAM_PERM_DENIED`   | STREAM     | ERROR    | Modal          | ❌    | "Enable Permissions"         |
| `CONVEX_MUTATION`      | CONVEX     | ERROR    | Toast          | ✅    | Auto-retry (3x)              |
| `UNKNOWN_ERROR`        | UNKNOWN    | ERROR    | Full Page      | ✅    | "Try Again" + "Report"       |

### UI State Types:

- **Inline Info/Warning:** Small alert within component.
- **Inline Error:** Error message within component boundary.
- **Toast:** Temporary notification (3-5 seconds).
- **Modal:** Centered modal requiring user action.
- **Full Page:** Entire page replaced with error UI.

---

## Usage Examples

### 1. Root App Integration

```typescript
import { errorHandler, ErrorBoundary } from "@/lib/errors";

// Configure global error handler
errorHandler.config = {
  logErrors: process.env.NODE_ENV === "development",
  onError: (error) => {
    toast.error(error.userMessage);
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

### 2. Wrapping Async Operations

```typescript
import { withErrorHandling } from "@/lib/errors";

const fetchData = async () => {
  return await withErrorHandling(
    async () => {
      const response = await fetch("/api/data");
      return response.json();
    },
    "NETWORK_SERVER_ERROR",
    { endpoint: "/api/data" },
  );
};
```

### 3. Using Error Hooks

```typescript
import { useErrorHandler, useErrorReset } from "@/lib/errors";

function MyComponent() {
  const { createError, handleError } = useErrorHandler();
  const { retry, canRetry } = useErrorReset(3);

  const handleAction = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      const appError = createError("CONVEX_MUTATION_FAILED", error);
      handleError(appError);

      if (canRetry) {
        await retry(async () => await someAsyncOperation());
      }
    }
  };

  return <button onClick={handleAction}>Perform Action</button>;
}

```

---

## Global Error Listeners

The system automatically attaches global listeners for:

1. **Unhandled Promise Rejections** - Catches `Promise.reject()` without `.catch()`.
2. **Global Runtime Errors** - Catches uncaught exceptions.

These are automatically attached when the error handler is initialized in `layout.tsx`.

---

## 🚦 Severity Levels

| Severity     | Description                      | UI Color | Log Level       |
| ------------ | -------------------------------- | -------- | --------------- |
| **INFO**     | Informational, user can continue | Blue     | `console.warn`  |
| **WARNING**  | May affect functionality         | Yellow   | `console.warn`  |
| **ERROR**    | Feature broken but app usable    | Red      | `console.warn`  |
| **CRITICAL** | App may be unusable              | Purple   | `console.error` |

---

## Migration from Old System

Update all imports from `@/lib/errorHandler` to `@/lib/errors`.
The following files have been **deleted** in favor of the new system:

- `src/lib/errorHandler.ts`
- `src/components/common/ErrorBoundary.tsx`
- `src/components/common/ErrorDisplay.tsx`

---

## Best Practices

- **Always use error codes** - Avoid creating generic errors.
- **Provide metadata** - Include context (like IDs or endpoints) for debugging.
- **Make errors recoverable** - Whenever possible, allow the user to retry.
- **Test scenarios** - Use the `implementation_plan.md` to verify network and auth failures.

```

**Next Step:** You can save this as `README.md` in your project root. Would you like me to help you write the `types.ts` file to match this documentation?

```

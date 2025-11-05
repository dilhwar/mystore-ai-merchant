# 🚀 Logging System - Quick Start Guide

## What is this?
A powerful logging system to track everything happening in the Products section. Every action, error, search, filter, and operation is now logged with full details.

## 📁 Files Created

### 1. `src/utils/logger.ts` (NEW)
- Main logger utility with colored console output
- Stores logs in memory (last 1000 logs)
- Specialized loggers for different modules

### 2. `src/app/tabs/products.tsx` (UPDATED)
- Added logging to all operations
- Tracks: loading, searching, filtering, sorting, pagination, refresh, etc.

### 3. `docs/LOGGING_GUIDE.md` (NEW - Arabic)
- Complete guide in Arabic
- All logging methods explained
- Examples and use cases

## 🎨 Log Levels & Colors

```
🔵 DEBUG   - Detailed development info (Cyan)
🔷 INFO    - General information (Blue)
🟡 WARN    - Warnings (Yellow)
🔴 ERROR   - Errors (Red)
🟢 SUCCESS - Successful operations (Green)
```

## 📊 What's Being Logged?

### ✅ All Operations Covered:
1. **Loading Products** - Load, refresh, load more
2. **Search** - Search queries and results count
3. **Filters** - Apply and clear filters
4. **Sorting** - Sort by name, price, date, stock
5. **Create** - New product creation
6. **Update** - Product updates
7. **Delete** - Product deletion
8. **Images** - Upload, validation, progress
9. **AI** - Content generation with AI
10. **Categories** - Category operations

## 💡 Quick Examples

### Example Console Output:

```
[2025-01-15T10:30:45.123Z] [INFO] Loading products list | {"component":"ProductsList","action":"load","language":"ar"}

[2025-01-15T10:30:45.678Z] [SUCCESS] Products loaded successfully: 12 items | {"component":"ProductsList","action":"load_success","count":12,"totalPages":1,"language":"ar"}

[2025-01-15T10:31:20.456Z] [INFO] Search results for "laptop": 3 items | {"component":"ProductsList","action":"search_results","query":"laptop","count":3,"originalCount":12}

[2025-01-15T10:32:10.789Z] [INFO] Applying filters | {"component":"ProductsList","action":"apply_filters","filters":{"category":"electronics","stockLevel":"in_stock","activeStatus":"active","resultCount":8}}

[2025-01-15T10:35:30.123Z] [ERROR] Failed to load products list
Error Details: {
  message: "Network request failed",
  code: "ERR_NETWORK",
  response: undefined,
  status: undefined,
  stack: "Error: Network request failed..."
}
```

## 🔧 Useful Functions

```typescript
import { logger } from '@/utils/logger';

// Get all logs
const allLogs = logger.getLogs();

// Get only errors
const errorLogs = logger.getLogs('error');

// Get summary
const summary = logger.getSummary();
// { total: 145, byLevel: { debug: 45, info: 60, warn: 15, error: 10, success: 15 } }

// Export logs as JSON
const json = logger.exportLogs();

// Clear logs
logger.clearLogs();
```

## 🎯 Benefits

✅ **Easy Debugging** - See exactly what's happening
✅ **Error Tracking** - Full error details with context
✅ **Performance Monitoring** - Track operation timing
✅ **User Behavior** - Understand how users interact
✅ **Automatic Documentation** - All operations are documented

## 📝 Log Format

Each log entry contains:
- **Timestamp** - Exact time
- **Level** - debug/info/warn/error/success
- **Message** - Human readable description
- **Context** - Additional data (language, user, page, filters, etc.)
- **Error Details** - For errors: message, code, response, stack trace

## 🚀 How to Use

### In Development:
- Open browser/metro console
- All logs appear with colors
- Filter by level or search text

### In Production:
- Logs stored in memory (last 1000)
- Can be exported and sent to server
- Use `logger.getSummary()` to check stats

## 📖 Full Documentation

For complete guide in Arabic, see: [LOGGING_GUIDE.md](./LOGGING_GUIDE.md)

---

**Now you can easily track any issue in the Products section!** 🎉

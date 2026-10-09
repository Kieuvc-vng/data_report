# API Integration Guide

## Setup

### 1. Install dependencies

```bash
npm install
```

This installs all required dependencies including React, testing libraries, and build tools.

### 2. Configure environment (.env.local)

Create or update `.env.local` with the following configuration:

```env
VITE_API_PROXY=http://localhost:4000
VITE_API_TIMEOUT=30000
VITE_LOG_LEVEL=debug
VITE_MULTIUSER=false
```

**Configuration Details:**
- `VITE_API_PROXY`: Base URL for the API backend (default: http://localhost:4000)
- `VITE_API_TIMEOUT`: Request timeout in milliseconds (default: 30000ms = 30 seconds)
- `VITE_LOG_LEVEL`: Logging level - can be "debug", "info", "warn", or "error" (default: debug)
- `VITE_MULTIUSER`: Enable multi-user mode (default: false for single-user development)

### 3. Start development server

```bash
npm run dev
```

This starts the Vite development server with hot module reloading. The application will be available at `http://localhost:5173`.

## API Endpoints

The API integration supports the following endpoints for accessing analytics, historical data, and reference information:

### Analytics Endpoints

#### Global Metrics Summary
```
GET /api/analytics/summary
```
Returns global metrics including:
- Total positions
- Active positions
- Filled positions
- Average time to fill

**Example Response:**
```json
{
  "totalPositions": 150,
  "activePositions": 45,
  "filledPositions": 105,
  "avgTimeToFill": 28
}
```

#### Active SLA Status
```
GET /api/analytics/active-sla
```
Returns current SLA status for active positions:
- On track positions
- At risk positions
- Overdue positions
- SLA compliance rate

**Example Response:**
```json
{
  "onTrack": 40,
  "atRisk": 3,
  "overdue": 2,
  "complianceRate": 93.3
}
```

#### Job Detail Analytics
```
GET /api/analytics/job/:job_code
```
Returns detailed analytics for a specific job by job code.

**Parameters:**
- `job_code` (string, required): The unique job code identifier

**Example Response:**
```json
{
  "jobCode": "ENG-001",
  "jobTitle": "Senior Engineer",
  "businessUnit": "Engineering",
  "department": "Product",
  "status": "Open",
  "openDate": "2025-09-01",
  "targetDate": "2025-10-01",
  "applications": 24,
  "interviews": 5,
  "offers": 1
}
```

### Historical Endpoints

#### Historical Positions
```
GET /api/analytics/historical-positions
```
Returns historical data about positions over time:
- Position counts by period
- Trends in hiring activity
- Historical status changes

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `groupBy` (optional): Group results by "day", "week", or "month" (default: month)

**Example Response:**
```json
{
  "data": [
    {
      "period": "2025-09-01",
      "total": 145,
      "active": 42,
      "filled": 103
    },
    {
      "period": "2025-10-01",
      "total": 150,
      "active": 45,
      "filled": 105
    }
  ]
}
```

#### Historical Metrics
```
GET /api/analytics/historical-metrics
```
Returns historical trend data for key metrics:
- Time to fill trends
- SLA compliance history
- Application and interview rates

**Query Parameters:**
- `metric` (optional): Specific metric to retrieve (default: all)
- `period` (optional): Period to retrieve (default: last 90 days)

**Example Response:**
```json
{
  "metrics": [
    {
      "date": "2025-09-01",
      "avgTimeToFill": 30,
      "complianceRate": 91,
      "applicationsPerPosition": 22
    },
    {
      "date": "2025-10-01",
      "avgTimeToFill": 28,
      "complianceRate": 93.3,
      "applicationsPerPosition": 24
    }
  ]
}
```

### Reference Data Endpoints

#### Business Units List
```
GET /api/analytics/business-units
```
Returns all available business units in the organization.

**Example Response:**
```json
{
  "businessUnits": [
    {
      "id": "BU-001",
      "name": "Engineering",
      "code": "ENG"
    },
    {
      "id": "BU-002",
      "name": "Sales",
      "code": "SAL"
    },
    {
      "id": "BU-003",
      "name": "Operations",
      "code": "OPS"
    }
  ]
}
```

#### Departments by Business Unit
```
GET /api/analytics/business-units/:bu/departments
```
Returns all departments within a specific business unit.

**Parameters:**
- `bu` (string, required): Business unit ID or code

**Example Response:**
```json
{
  "businessUnit": "ENG",
  "departments": [
    {
      "id": "DEPT-001",
      "name": "Product",
      "code": "PROD"
    },
    {
      "id": "DEPT-002",
      "name": "Infrastructure",
      "code": "INFRA"
    },
    {
      "id": "DEPT-003",
      "name": "QA",
      "code": "QA"
    }
  ]
}
```

#### Positions by Department
```
GET /api/analytics/business-units/:bu/departments/:dept/positions
```
Returns all position types/categories within a specific department of a business unit.

**Parameters:**
- `bu` (string, required): Business unit ID or code
- `dept` (string, required): Department ID or code

**Example Response:**
```json
{
  "businessUnit": "ENG",
  "department": "PROD",
  "positions": [
    {
      "id": "POS-001",
      "name": "Senior Engineer",
      "code": "SENIOR-ENG"
    },
    {
      "id": "POS-002",
      "name": "Junior Engineer",
      "code": "JUNIOR-ENG"
    },
    {
      "id": "POS-003",
      "name": "Engineering Manager",
      "code": "ENG-MGR"
    }
  ]
}
```

## Error Handling

The API client handles three types of errors systematically:

### ApiError (HTTP Errors)
Raised for HTTP status codes in the 4xx or 5xx range.

**Characteristics:**
- `statusCode`: HTTP status code (e.g., 400, 404, 500)
- `message`: Human-readable error message
- `response`: Full API response data

**Common HTTP Errors:**
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error
- `503 Service Unavailable`: API service temporarily unavailable

### TimeoutError
Raised when a request exceeds the configured timeout duration.

**Characteristics:**
- Occurs when response time exceeds `VITE_API_TIMEOUT` milliseconds
- Typically indicates network latency or server performance issues
- Should trigger a retry mechanism

### NetworkError
Raised when there are connection issues.

**Characteristics:**
- Connection refused or timeout at the network level
- DNS resolution failures
- CORS policy violations
- Network interface down

### Using the Error Handler Hook

The `useErrorHandler()` hook provides a standard way to format errors for UI display:

```typescript
import { useErrorHandler } from '@/api/hooks'

function MyComponent() {
  const handleError = useErrorHandler()

  const fetchData = async () => {
    try {
      const data = await apiClient.get('/api/analytics/summary')
      // Process data
    } catch (error) {
      const formattedError = handleError(error)
      // Display to user with appropriate message and icon
      showNotification({
        type: formattedError.type, // 'error', 'warning', or 'info'
        title: formattedError.title,
        message: formattedError.message
      })
    }
  }

  return (
    <button onClick={fetchData}>Load Data</button>
  )
}
```

**Error Handler Return Format:**
```typescript
{
  type: 'error' | 'warning' | 'info',
  title: string,
  message: string,
  details?: string
}
```

## Caching

The API client includes an automatic caching mechanism to improve performance and reduce server load:

### Cache Characteristics

- **Default TTL (Time To Live):** 5 minutes (300,000 milliseconds)
- **Automatic Invalidation:** Stale data is automatically removed after TTL expires
- **Key-based Storage:** Cache keys are based on endpoint URLs and query parameters
- **Memory Storage:** Cache is stored in application memory (cleared on page refresh)

### Invalidating Cache

For scenarios where you need to manually invalidate cache:

```typescript
import { queryCache } from '@/api/cache'

// Invalidate all position-related caches using regex pattern
queryCache.invalidate('positions:.*')

// Invalidate specific business unit cache
queryCache.invalidate('business-units:ENG')

// Clear all cached data
queryCache.clear()

// Invalidate cache for a specific endpoint
queryCache.invalidate('analytics:summary')
```

### Cache Key Patterns

Common cache key patterns used by the API:

- `analytics:summary` - Global summary metrics
- `analytics:active-sla` - SLA status
- `analytics:job:${jobCode}` - Specific job details
- `positions:.*` - All position-related data
- `business-units:${buId}` - Business unit data
- `departments:${buId}:${deptId}` - Department data

### Cache Configuration

To adjust cache TTL globally, modify the cache configuration in `src/api/cache.ts`:

```typescript
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds
```

## Testing

The project uses Vitest as the testing framework with support for unit tests, integration tests, and UI testing.

### Running Tests

#### Run all tests
```bash
npm run test
```

This runs all test files (`*.test.ts`, `*.test.tsx`) and displays results in the terminal.

#### Run tests in watch mode
```bash
npm run test -- --watch
```

Automatically re-runs tests when source files change.

#### Run tests with UI dashboard
```bash
npm run test:ui
```

Opens an interactive web-based dashboard for viewing and debugging tests. Visit `http://localhost:51204/__vitest__/` to access the UI.

#### Generate coverage report
```bash
npm run test:coverage
```

Generates a coverage report showing:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

Coverage reports are generated in `coverage/` directory.

#### Run specific test file
```bash
npm run test api.test.ts
```

#### Run tests matching a pattern
```bash
npm run test -- --grep "analytics"
```

### Test Structure

Tests are organized by module:

```
src/
├── modules/
│   └── reports-analytics/
│       └── tests/
│           ├── api.test.ts         # API integration tests
│           ├── hooks.test.ts        # React hooks tests
│           └── components/          # Component tests
│               ├── Dashboard.test.tsx
│               └── Charts.test.tsx
```

### Writing Tests

Example test file structure:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAnalytics } from '@/hooks'

describe('useAnalytics', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should fetch analytics data', async () => {
    const { result } = renderHook(() => useAnalytics())

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.data.totalPositions).toBe(150)
  })
})
```

### Continuous Integration

Tests run automatically in CI/CD pipeline on:
- Pull request creation/updates
- Commits to main branch
- Manual workflow dispatch

## Performance Targets

The API integration is optimized to meet the following performance targets:

### First Contentful Paint (FCP)
- **Target:** < 2 seconds
- **Current:** Monitored via Web Vitals
- **Optimization:** Code splitting, critical CSS inlining, image optimization

### API Response Time
- **Target:** < 1 second per request
- **Current:** Monitored via API metrics
- **Optimization:** Query optimization, database indexing, request deduplication

### Cache Hit Rate
- **Target:** > 70%
- **Current:** Tracked in analytics
- **Optimization:** Strategic cache key design, appropriate TTL configuration

### Monitoring Performance

Track performance metrics using:

```typescript
import { reportWebVitals } from '@/utils/performance'

reportWebVitals((metric) => {
  console.log(metric.name, metric.value)
  // Send to analytics service
})
```

### Recommended Optimizations

1. **Enable Request Deduplication:** Automatically enabled for identical concurrent requests
2. **Leverage Browser Cache:** Set appropriate Cache-Control headers
3. **Compress Responses:** Enable gzip compression on API server
4. **Implement Progressive Loading:** Load critical data first, supplementary data later
5. **Use Code Splitting:** Separate vendor and application code

## Development Workflow

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# 3. Start development server
npm run dev

# 4. In another terminal, run tests
npm run test

# 5. Open browser to http://localhost:5173
```

### Common Tasks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Debugging API Calls

1. Enable debug logging by setting `VITE_LOG_LEVEL=debug` in `.env.local`
2. Open browser DevTools (F12)
3. Go to Network tab to inspect API requests/responses
4. Check Console tab for debug logs
5. Use React DevTools extension to inspect component state

## Troubleshooting

### Common Issues

**Issue:** API requests timing out
- **Solution:** Increase `VITE_API_TIMEOUT` in `.env.local` or check backend server status

**Issue:** CORS errors when calling API
- **Solution:** Verify `VITE_API_PROXY` is correctly configured and backend allows requests

**Issue:** Stale data displayed
- **Solution:** Clear cache using `queryCache.clear()` in browser console

**Issue:** Tests failing locally but passing in CI
- **Solution:** Check Node.js version matches CI environment, clear node_modules and reinstall

**Issue:** High memory usage during testing
- **Solution:** Run tests with coverage separately from main test suite

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library Documentation](https://testing-library.com/)

## Support

For questions or issues with API integration:
1. Check this guide first
2. Review test examples in `src/modules/reports-analytics/tests/`
3. Check recent commits for changes to API handling
4. Contact the team via the project repository issues

# Hiring Dashboard

A modern, data-driven hiring analytics platform built with React 19, TypeScript, and Zustand. Provides real-time hiring metrics, position tracking, and comprehensive reporting capabilities.

## Features

- **Query Form**: Filter hiring data by date range, team, and position with an intuitive form interface
- **Full-Page Analytics**: Display comprehensive analytics in a full-page view with seamless back-to-query navigation
- **Interactive Charts & Visualizations**:
  - Pipeline Flow Chart: Unified 5-stage pipeline visualization with drop indicators and rejection analysis
    - Tracks candidates through CV → 1st Interview → 2nd Interview → Offer → Offer Accepted
    - Shows drop counts between stages with detailed rejection reason popover
    - Offer stage breakdown: Candidate Declined (with sub-reasons) + Company Withdrew
  - Rejection Reasons Analysis: Detailed breakdown by pipeline stage and candidate withdrawal tracking
- **Position Detail Page**: Comprehensive view of individual job positions with pipeline visualization and candidate insights
  - **Pipeline Visualization**: Dual-view pipeline (Kanban & Funnel) showing candidate progression through recruitment stages
  - **Rejection Analysis**: Interactive popover displays detailed rejection reasons at each stage transition
  - **Candidate Insights**: Industry and company distribution charts with count and percentage metrics
- **Advanced Filtering**: Multi-select team and level filters with intelligent display logic
- **Rejection Tracking**: Detailed rejection popover with hierarchical breakdown by pipeline stage
- **CSV Export**: Download hiring summary data in CSV format with proper formatting
- **PDF Export**: Generate professional PDF reports with charts and metrics
- **Current Openings Tab**: Browse and filter active job positions by team
- **Historical Data Tab**: Query historical hiring trends with custom date ranges and filters

## Tech Stack

- **React 19.2.8**: Latest React with enhanced features and performance
- **TypeScript 6.0**: Type-safe development with strict mode enabled
- **Zustand 5.0**: Lightweight state management for hiring and auth data
- **Recharts 3.10**: Composable charting library for interactive visualizations
- **Tailwind CSS 3.4**: Utility-first styling framework for responsive design
- **Vite 8.3**: Next-generation frontend build tool for fast development
- **Vitest & React Testing Library**: Unit and integration testing framework

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hiring-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview the production build**
   ```bash
   npm run preview
   ```

## Features Overview

### Current Openings Tab
Browse all active job positions with team-based filtering. View position details including team assignment, status, and required qualifications. Filter by team to focus on specific hiring initiatives.

### Historical Data Tab
Query hiring data across custom date ranges. Filter by team and position to analyze specific hiring trends. Results display comprehensive metrics and visualizations of historical performance.

### Analytics Charts
- **Pipeline Funnel**: Track candidates through CV submission, 1st interview, 2nd interview, and offer stages
- **Rejection Analysis**: Understand rejection patterns across skill mismatch, experience level, salary, and other factors
- **Level Distribution**: Visualize candidate seniority levels to ensure balanced hiring
- **Team Performance**: Compare hiring efficiency and volume across teams

### Data Export
Export hiring summaries to CSV format for spreadsheet analysis. Generate professional PDF reports with embedded charts for stakeholder presentations.

## Component Structure

| Component | Purpose |
|-----------|---------|
| **App** | Main application container, tab management, and full-page navigation state |
| **Header** | Navigation bar with branding and user information |
| **TabNavigation** | Tab switching between Current Openings and Historical Data |
| **CurrentOpeningsTab** | Displays active positions with team filtering capability |
| **HistoricalTabQueryForm** | Form interface for date range and filter selection |
| **HistoricalAnalyticsPage** | Full-page analytics display with charts, metrics, and export options |
| **FilterBar** | Multi-select filter container for team and level selection |
| **FilterDropdown** | Reusable dropdown component with multi-select and smart label display |
| **PipelineFlowChart** | Unified 5-stage pipeline visualization with drop indicators and rejection analysis |
| **PositionDetailPage** | Individual job position detail view with key metrics and pipeline visualization |
| **PositionPipelineVisualization** | Dual-view pipeline component with Kanban (8 stages) and Funnel (5 stages) views |
| **PipelineVisualizationTabs** | Tab navigation between Kanban and Funnel visualization modes |
| **RejectionPopover** | Modal component displaying detailed rejection breakdown by pipeline stage |
| **ResultsModal** | Legacy modal component (deprecated - replaced by HistoricalAnalyticsPage) |
| **SummaryCards** | Summary metric cards displaying key KPIs and statistics |
| **PositionRow** | Individual position item in positions list |
| **PositionAccordion** | Expandable position details with candidate information |
| **TeamFilter** | Dropdown selector for team-based filtering |
| **Badge** | Small label component for status and category tags |
| **Card** | Reusable container component for content blocks |

## Usage Examples

### Filter Positions by Team
```typescript
// In CurrentOpeningsTab component
const [activeTeam, setActiveTeam] = useState('All Teams');

// User selects a team from dropdown
// Component filters positions by team
const filteredPositions = activeTeam === 'All Teams' 
  ? positions 
  : positions.filter(p => p.team === activeTeam);
```

### Query Historical Data
```typescript
// In App component - submit query form
const handleHistoricalQuery = (params) => {
  const summary = getHiringSummaryByDateRange(
    params.startDate,
    params.endDate,
    params.team
  );
  setHiringSummary(summary);
  setShowAnalyticsPage(true);  // Navigate to full-page analytics
};

// Return full-page analytics view
if (showAnalyticsPage && hiringSummary) {
  return (
    <HistoricalAnalyticsPage
      summary={hiringSummary}
      query={historicalQuery}
      onBack={() => {
        setShowAnalyticsPage(false);
        setHistoricalQuery(null);
        setHiringSummary(null);
      }}
    />
  );
}
```

### Export Data to CSV
```typescript
import { exportToCSV } from './utils';

// Export hiring summary
exportToCSV(hiringSummary, 'hiring-report.csv');
```

### Export Data to PDF
```typescript
import { exportToPDF } from './utils';

// Generate PDF report
exportToPDF(hiringSummary, 'hiring-report.pdf');
```

## State Management

The application uses Zustand for state management with two main stores:

### hiringStore
Manages hiring data including positions, candidates, and hiring metrics.

### authStore
Manages user authentication state and user roles.

## Testing

Run unit and integration tests with coverage reporting:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test:coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/ResultsModal.test.ts
```

Test files are located in `src/__tests__` directory with matching folder structure.

## Linting

Check code quality with Oxlint:

```bash
# Run linter
npm run lint

# Fix linting errors (when applicable)
npm run lint -- --fix
```

## Build

Create an optimized production build:

```bash
# Type check and build
npm run build

# Output goes to dist/ directory
```

Build output includes:
- Minified JavaScript and CSS
- Optimized assets
- Source maps for debugging
- Build time and size reporting

## File Structure

```
src/
├── components/        # React components
├── stores/           # Zustand state management
├── hooks/            # Custom React hooks
├── utils/            # Utility functions (export, format, transform)
├── types/            # TypeScript type definitions
├── data/             # Mock data and data sources
├── __tests__/        # Test files matching src structure
├── App.tsx           # Main app component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and ensure tests pass
   ```bash
   npm test
   npm run lint
   ```

3. **Build and preview** your changes
   ```bash
   npm run build
   npm run preview
   ```

4. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add new filtering capability"
   ```

5. **Push and create a pull request**

## Contributing Guidelines

We welcome contributions! Please follow these guidelines:

1. **Code Quality**: Ensure all tests pass and linter shows no errors
2. **Type Safety**: Use TypeScript for all new code
3. **Component Design**: Keep components focused and reusable
4. **Documentation**: Add comments for complex logic
5. **Testing**: Write tests for new features and bug fixes
6. **Commits**: Use clear, descriptive commit messages
7. **Pull Requests**: Include a summary of changes and testing performed

## Performance Considerations

- Charts use Recharts' ResponsiveContainer for automatic sizing
- State updates are optimized using Zustand's shallow equality
- Components are designed for lazy loading support
- CSS is compiled with Tailwind for optimal bundle size

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**Port already in use**: The dev server uses port 5173 by default. If unavailable, Vite will use the next available port.

**Module resolution errors**: Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build failures**: Check that TypeScript compilation succeeds
```bash
npm run build
```

## License

This project is proprietary software. All rights reserved.

## Support

For issues, questions, or contributions, please contact the development team or create an issue in the project repository.

---

**Last Updated**: October 1, 2026  
**Version**: 0.2.0  
**Latest Changes**: Phase 4 & 5 Complete - Hiring Dashboard Analytics Redesign
- Created PipelineFlowChart component: unified 5-stage pipeline with drop indicators and rejection analysis
- Created RejectionPopover component: detailed rejection breakdown by stage
- Created FilterBar & FilterDropdown: multi-select filtering with intelligent label display
- Updated data structures with nested rejection reasons (byStage + offer stage breakdown)
- Enhanced mock data with candidate decline reasons (Comp & Salary, Culture Fit, Career Path, Personal)
- Updated export utilities (CSV/PDF) with new metrics and layout

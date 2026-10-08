# Hiring Dashboard Mini App - Design Specification

**Date:** 2026-09-30  
**Version:** 1.3  
**Status:** In Development  
**Last Updated:** 2026-10-09 (Added Candidate Insights section with Education Background & Source via Solace sync)

---

## 1. Overview

**Purpose:** Self-service hiring pipeline tracking and historical review for HRBP and Head of TA  
**Scope:** Web application (responsive, desktop + mobile)  
**Users:**
- Head of TA: Can view all teams' data
- HRBP: Can view only their own team's data

**Key Objective:** Eliminate manual report creation by recruiters. Users access app and self-serve hiring data.

---

## 2. Tech Stack

- **Frontend:** React + TypeScript
- **State Management:** Zustand
- **UI Components:** shadcn/ui + Tailwind CSS
- **Data Visualization:** Recharts
- **Mock Data:** For MVP (ATS integration planned for Phase 2)
- **Export:** CSV + PDF functionality

---

## 3. Data Model

### Position (Current Opening)
```typescript
interface Position {
  id: string;
  team: 'PEN' | 'GDS' | 'GIO' | 'PRO' | 'PIN';
  title: string;
  level: string;
  salary: string;
  hc: number;
  priority: 'P1' | 'P2' | 'P3';
  status: 'open' | 'filled' | 'closed';
  pipeline: {
    cv: number;
    firstInterview: number;
    secondInterview: number;
    offers: number;
  };
  rejectReasons: {
    notFitSkills: number;
    lowExp: number;
    salaryMismatch: number;
    other: number;
  };
  createdDate: string;
  estimatedFillDays: number;
}
```

### Candidate (Hired)
```typescript
interface Candidate {
  id: string;
  name: string;
  previousCompany: string;
  industry: string;
  education: string;
  salary: string;
  hireDate: string;
  position: string;
  team: string;
}
```

### Hiring Summary (Historical)
```typescript
interface HiringSummary {
  dateRange: { start: string; end: string };
  team?: string;
  totalHired: number;
  salaryRange: string;
  hcTotal: number;
  pipeline: { cv: number; itv: number; offers: number };
  rejectReasons: { [key: string]: number };
  levelDistribution: { [key: string]: number };
  byTeam: { [team: string]: number };
  aiInsight: string;
}
```

---

## 4. Feature Specifications

### 4.1 Current Opening Positions Tab

**Layout:** Full width, no sidebar

**Components:**
1. **Tab Navigation**
   - Current Opening Positions (active by default)
   - Historical Data

2. **Team Filter Section** (Top of page)
   - Label: "Team Filter"
   - Display: Horizontal button/pill layout
   - Options: All Teams | PEN | GDS | GIO | PRO | PIN
   - Behavior: Single selection, state persists on tab
   - Independent from Historical Data tab team filter

3. **Executive Summary Cards** (Single row)
   - Total HC: Total headcount across selected team
   - Priority 1: Count of P1 positions
   - Avg Fill Time: Average days to fill a position
   - Responsive: 3 cards on desktop, 2 on tablet, 1 on mobile

4. **Positions by Team** (Accordion)
   - Each team as collapsible accordion
   - Expanded by default for PEN team
   - Each position shows:
     - Position title + level
     - HC count
     - Salary range
     - Priority badge (P1=red, P2=yellow)
     - Pipeline funnel (CV → 1st ITV → 2nd ITV → Offer)
   - Clickable row → Detail modal (future enhancement)

5. **Action Bar**
   - Export CSV button
   - Export PDF button
   - Exports current filtered data

**Data Updates:** On-demand (when user changes team filter)

---

### 4.2 Historical Data Tab

**Layout:** Full width content area with dedicated analytics page

**Phase 1: Query Form (Initial State)**
- Query form with:
  - Start date picker (required)
  - End date picker (required)
  - Team filter dropdown - "All Teams" by default
  - Position title search field (optional)
  - "🔍 Search" button
  - "Clear" button to reset form

**Phase 2: Full-Page Analytics Results**
- Navigates to dedicated analytics page (not modal)
- **Header Section:**
  - "← Back to Query" button (returns to query form)
  - Large "Hiring Analytics" title (text-3xl)
  - Date range display: "Sep 1, 2026 - Sep 30, 2026"

**Dynamic Filtering (Multi-select):**
- **Team Filter:** Dropdown with multi-select checkboxes
  - Default: All teams selected (PEN, GDS, GIO, PRO, PIN)
  - Behavior: Click to toggle individual teams
  - Metrics update instantly when selection changes
  
- **Level Filter:** Dropdown with multi-select checkboxes
  - Default: All levels selected (1.1, 1.2, 1.3, 2.1, 2.2, 2.3)
  - Behavior: Click to toggle individual levels
  - Supports combining team + level filters

- **Empty State:** When no teams/levels selected, metrics show "N/A" and bars are hidden

**Analytics Content:**

**Page Content (Full Width):**
1. **Summary Cards** (5 columns - grid layout)
   - Total Hired: Count of hired candidates (N/A if no data)
   - CVs Received: Number of CVs in pipeline
   - Offer Salary: Min-Max salary range (N/A if no data)
   - Time to Fill: Avg days to fill (N/A if no data)
   - Offer Acceptance: % of offers accepted (N/A if no offers)

2. **Pipeline Progression & Rejection Analysis**
   - Full-width horizontal bar chart showing hiring funnel
   - **Bar Scaling:** Percentage-based (0-100% baseline = 0-200px width)
     - Ensures proportional visualization at any data scale
     - CV Sent = 100% baseline → full width
     - Offer = 2-4% baseline → thin bar
   - **Metrics per stage:**
     - Stage name + candidate count
     - % of baseline (relative to CV Sent)
     - % from previous stage (conversion rate)
     - Drop count indicator between stages
   - **Rejection Breakdown:** Popup on "↓ drop" hover/click
     - Shows reasons for candidate rejection at each stage

3. **AI Insight** (Gradient blue box with icon)
   - Auto-generated summary
   - Key metrics, top team, risks

4. **Candidate Insights** (New: 2026-10-09)
   - **Location:** Below "Pipeline Progression & Rejection Analysis"
   - **Data Source:** Synced from Solace app (candidate data for hired employees)
   - **Layout:** 2x2 grid (4 sections)
   
   **Sections:**
   - **Industry** (Bar Chart)
     - Shows distribution of top industries candidates came from
     - Orange bars, percentage display
     - Subtitle: "Hired candidates · all time"
   
   - **Company** (Bar Chart)
     - Shows distribution of top companies candidates came from
     - Blue bars, percentage display
     - Subtitle: "Hired candidates · all time"
   
   - **Education Background** (Donut Chart) ⭕
     - Shows educational qualifications of hired candidates
     - Segments: Bachelor's CS, Master's CS, Bachelor's Eng, Self-Taught, etc.
     - Purple color scheme
     - Custom legend with count display
     - Subtitle: "Hired candidates · all time"
   
   - **Source** (Donut Chart) ⭕
     - Shows recruitment sources (LinkedIn, Referral, JobBoard, Direct Application)
     - Green color scheme
     - Custom legend with count display
     - Subtitle: "Hired candidates · all time"
   
   **Data Model Additions:**
   ```typescript
   // Added to Position interface
   topIndustries?: Array<{ name: string; count: number }>
   topCompanies?: Array<{ name: string; count: number }>
   topEducationBackground?: Array<{ name: string; count: number }>
   topSource?: Array<{ name: string; count: number }>
   
   // Added to HiringSummary interface
   topIndustries?: Array<{ name: string; count: number }>
   topCompanies?: Array<{ name: string; count: number }>
   topEducationBackground?: Array<{ name: string; count: number }>
   topSource?: Array<{ name: string; count: number }>
   ```
   
   **Components Created:**
   - `DonutChart.tsx`: Reusable donut/pie chart component with custom legend
   
   **Implementation Details:**
   - Position Detail Page: Shows insights for specific position's active pipeline
   - Historical Analytics Page: Shows insights for hired candidates in date range
   - Both pages use same hybrid visualization approach (Bar + Donut charts)

**Page Footer:**
- "📊 Export CSV" button (green)

**Layout Advantages Over Modal:**
- Full viewport space for chart visualization
- No size constraints on data display
- Professional dashboard appearance
- Easy to add future features (drill-down, filters)
- Better mobile responsiveness (charts stack vertically)

**Data Updates:**
- Daily at 9 AM and 5 PM (fixed schedule)
- Manual re-query by changing dates or clicking "Tra cứu"
- Auto-update when team filter changes (within modal)

---

## 5. Access Control

| Feature | Head of TA | HRBP |
|---------|-----------|------|
| Current Openings Tab | All teams visible | Own team only |
| Historical Data Tab | Query all teams | Query own team only |
| Export CSV/PDF | ✓ | ✓ |

**Implementation:** User role stored in authStore (Zustand), filtered at display level

---

## 6. State Management (Zustand)

**Stores:**
1. `hiringStore`
   - positions: Position[]
   - candidates: Candidate[]
   - currentTeam: string (for Current tab)
   - getVisiblePositions(): Position[]
   - getVisibleCandidates(): Candidate[]
   - setCurrentTeam(team: string): void

2. `authStore`
   - userRole: 'hrbp' | 'head_of_ta'
   - userTeam?: string (only for HRBP)
   - getAccessLevel(): 'all' | 'team-only'

3. `historicalStore` (future: separate store for historical queries)
   - query: { startDate, endDate, team }
   - results: HiringSummary
   - setQuery(...): void
   - fetchResults(...): void

---

## 7. Export Functionality

**CSV Export:**
- Format: Standard CSV (comma-separated values)
- Content: Filtered position/candidate data based on current filters
- Filename: `hiring_report_YYYY-MM-DD.csv`
- Opens in Excel, Google Sheets, etc.

**PDF Export:**
- Format: Formatted PDF report
- Content: Summary cards + charts + data tables
- Header: Date range + team filter applied
- Footer: Generated date/time
- Filename: `hiring_report_YYYY-MM-DD.pdf`

---

## 8. Mock Data Strategy

**MVP:** In-memory mock data (no backend calls)
- `mockData.ts`: Seed data for positions, candidates, hiring summaries
- Updated manually during development
- Easily swappable when ATS integration happens

**Seed Data Includes:**
- 25 total positions across 5 teams
- 50 hired candidates with full details
- Multiple date ranges for historical queries

---

## 9. Responsive Design

**Breakpoints:**
- Desktop: 1200px+ (full layout)
- Tablet: 768px - 1199px (2-column, adjusted spacing)
- Mobile: <768px (1-column stacked, scrollable)

**Key adjustments:**
- Team filter: Horizontal wrap on all sizes, but flexible
- Summary cards: 4 cols (desktop) → 2 cols (tablet) → 1 col (mobile)
- Charts grid: 2x2 (desktop) → 2x2 (tablet) → 1 col stack (mobile)
- Tables: Horizontal scroll on mobile
- Analytics page: Full width on all sizes, no modal constraints

---

## 10. Error Handling

**Scenarios:**
- No data found for query → Show "No results" message
- Invalid date range → Validation message on form
- API failure (Phase 2) → Fallback to cached data or error message
- User permission denied → Redirect or disabled view

---

## 11. Performance Considerations

- Mock data: < 1KB (negligible load)
- Charts render with Recharts (optimized)
- Modal lazy-loaded (opens on demand)
- No pagination needed for MVP (small dataset)
- Future: Implement virtual scrolling for large candidate lists

---

## 12. Testing Strategy

**Unit Tests:**
- Data filtering logic (by team, date range)
- State management (Zustand stores)
- Export function (CSV/PDF generation)

**Integration Tests:**
- Tab switching (data persistence)
- Team filter change (re-render, state update)
- Query execution (mock API call)

**E2E Tests (future):**
- User flow: Navigate tab → Change filter → Export
- Historical query flow: Select dates → Query → Change team filter

---

## 13. Future Enhancements (Phase 2+)

- ATS integration (replace mock data)
- Position detail modal (drill-down)
- Notifications (data updated at 9 AM / 5 PM)
- Additional filters (salary range, HC range, status)
- Real-time data updates (WebSocket)
- User preferences (saved filters, custom dashboards)
- Advanced analytics (trend charts, forecasting)

---

## 14. Deliverables Checklist

- [ ] React + TypeScript project setup
- [ ] Zustand store architecture
- [ ] shadcn/ui component integration
- [ ] Current Openings Tab UI + logic
- [ ] Historical Data Tab UI + logic
- [ ] Mock data seed
- [ ] CSV/PDF export
- [ ] Responsive design testing
- [ ] User role/permission logic
- [ ] Comprehensive testing (unit + integration)
- [ ] Documentation (README, setup guide)

---

## Appendix A: Data Flow Diagram

```
User Input (Team Filter, Date Range)
    ↓
Zustand Store (hiringStore, authStore)
    ↓
Data Filter & Transform
    ↓
React Components (render)
    ↓
Charts (Recharts) / Tables / Cards
    ↓
Export (CSV/PDF)
```

---

## Appendix B: Wireframe References

See mockup files:
- `mockup-updated-current-v2.html` - Current Openings Tab
- `mockup-updated-historical-v2.html` - Historical Data Tab (with team filter in modal)

---

**Document approved:** ✓ User approval on 2026-09-30
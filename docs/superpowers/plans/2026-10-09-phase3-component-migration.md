# Phase 3: Component Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate data_report components to Solace ATS reports-analytics module as a new HiringDashboardTab, maintaining functionality and applying Solace design tokens.

**Architecture:** 
1. Create `HiringDashboardTab/` folder under `reports-analytics/components/`
2. Copy and adapt 15+ core components from data_report
3. Update imports to use Solace utilities and types
4. Create HiringDashboardPage wrapper in pages/
5. Integrate with Solace's ReportsLayout and routes

**Tech Stack:** React 19, TypeScript, Recharts, Zustand (already in Solace), Tailwind CSS

**Solace Path:** `C:\Users\LAP14052\Downloads\AI Project\AIT Project\VNGG-ATS\frontend\src\modules\reports-analytics`

**Data_report Path:** `C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src`

---

## File Structure

```
reports-analytics/
├── components/
│   └── HiringDashboardTab/ (NEW)
│       ├── index.ts (exports)
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── BusinessUnitAccordion.tsx
│       ├── DepartmentAccordion.tsx
│       ├── PositionAccordion.tsx
│       ├── PositionRow.tsx
│       ├── CurrentOpeningsTab.tsx
│       ├── FilterBar.tsx
│       ├── FilterDropdown.tsx
│       ├── SummaryCards.tsx
│       ├── ResultsModal.tsx
│       ├── HistoricalAnalyticsPage.tsx
│       ├── HistoricalTabQueryForm.tsx
│       ├── DonutChart.tsx
│       ├── PipelineFlowChart.tsx
│       ├── PipelineVisualizationTabs.tsx
│       ├── PositionPipelineVisualization.tsx
│       ├── RejectionPopover.tsx
│       ├── TeamFilter.tsx
│       ├── ExpandCollapseControls.tsx
│       ├── hooks/ (NEW)
│       │   ├── useSummaryMetrics.ts
│       │   └── index.ts
│       ├── utils/ (NEW)
│       │   ├── dataTransformUtils.ts
│       │   └── index.ts
│       └── data/ (NEW)
│           └── mockData.ts
├── pages/
│   └── HiringDashboardPage.tsx (NEW)
└── ReportsLayout.tsx (MODIFY - add HiringDashboardTab)
```

---

## Task 1: Create HiringDashboardTab Folder Structure

**Files:**
- Create: `frontend/src/modules/reports-analytics/components/HiringDashboardTab/`
- Create: `frontend/src/modules/reports-analytics/components/HiringDashboardTab/index.ts`
- Create: `frontend/src/modules/reports-analytics/components/HiringDashboardTab/hooks/index.ts`
- Create: `frontend/src/modules/reports-analytics/components/HiringDashboardTab/utils/index.ts`
- Create: `frontend/src/modules/reports-analytics/components/HiringDashboardTab/data/index.ts`

- [ ] **Step 1: Create main folder**

```bash
cd "C:\Users\LAP14052\Downloads\AI Project\AIT Project\VNGG-ATS\frontend\src\modules\reports-analytics\components"
mkdir HiringDashboardTab
```

- [ ] **Step 2: Create subfolders**

```bash
cd HiringDashboardTab
mkdir hooks utils data
```

- [ ] **Step 3: Create empty index files**

```bash
# Create hooks/index.ts
echo "" > hooks/index.ts

# Create utils/index.ts
echo "" > utils/index.ts

# Create data/index.ts
echo "" > data/index.ts

# Create main index.ts
echo "" > index.ts
```

- [ ] **Step 4: Verify structure**

```bash
tree HiringDashboardTab
```

Expected output shows all subdirectories created.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/
git commit -m "chore: create HiringDashboardTab folder structure for Solace integration"
```

---

## Task 2: Copy and Adapt Utilities and Hooks

**Files:**
- Copy: `dataTransformUtils.ts` → `utils/dataTransformUtils.ts`
- Copy: `mockData.ts` → `data/mockData.ts` (if exists in data_report)
- Copy: `useSummaryMetrics.ts` → `hooks/useSummaryMetrics.ts`
- Create: `utils/index.ts` (exports)
- Create: `hooks/index.ts` (exports)
- Create: `data/index.ts` (exports)

- [ ] **Step 1: Copy dataTransformUtils from data_report**

Source: `C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\utils\dataTransformUtils.ts`

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\utils\dataTransformUtils.ts" utils/
```

- [ ] **Step 2: Create utils/index.ts exports**

```typescript
export * from './dataTransformUtils';
```

- [ ] **Step 3: Copy useSummaryMetrics hook**

Source: `C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\hooks\useSummaryMetrics.ts`

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\hooks\useSummaryMetrics.ts" hooks/
```

- [ ] **Step 4: Create hooks/index.ts exports**

```typescript
export { useSummaryMetrics } from './useSummaryMetrics';
```

- [ ] **Step 5: Check for mock data in data_report**

```bash
# Check if data_report has a data/ folder or mock data
dir "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\data"
```

If exists, copy it. If not, create a placeholder:

```typescript
// data/mockData.ts
export const mockPositions = [];
export const mockBusinessUnits = [];
```

- [ ] **Step 6: Create data/index.ts exports**

```typescript
export * from './mockData';
```

- [ ] **Step 7: Verify imports in copied files**

Open `utils/dataTransformUtils.ts` and `hooks/useSummaryMetrics.ts`:
- Check for any local imports like `import from '../types'`
- Note any dependencies that need adjustment

- [ ] **Step 8: Commit**

```bash
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/hooks/
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/utils/
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/data/
git commit -m "chore: copy utilities, hooks, and mock data to HiringDashboardTab"
```

---

## Task 3: Copy and Adapt UI Components (Batch 1 - Foundation)

**Files:**
- Copy: `Badge.tsx` → `Badge.tsx` (colors already updated in data_report)
- Copy: `Card.tsx` → `Card.tsx`
- Copy: `ExpandCollapseControls.tsx` → `ExpandCollapseControls.tsx`
- Copy: `RejectionPopover.tsx` → `RejectionPopover.tsx`

- [ ] **Step 1: Copy Badge.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\Badge.tsx" .
```

Verify it contains Solace colors (red-100, yellow-100, gray-100, etc. are already mapped).

- [ ] **Step 2: Copy Card.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\Card.tsx" .
```

- [ ] **Step 3: Copy ExpandCollapseControls.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\ExpandCollapseControls.tsx" .
```

- [ ] **Step 4: Copy RejectionPopover.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\RejectionPopover.tsx" .
```

- [ ] **Step 5: Verify imports in all 4 files**

Open each file and check imports:
- Verify relative imports exist (e.g., `./Badge` should stay)
- Note any absolute imports to update

- [ ] **Step 6: Create imports in main index.ts**

```typescript
export { Badge } from './Badge';
export { Card } from './Card';
export { ExpandCollapseControls } from './ExpandCollapseControls';
export { RejectionPopover } from './RejectionPopover';
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/*.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/index.ts
git commit -m "chore: copy foundation UI components (Badge, Card, Popover)"
```

---

## Task 4: Copy and Adapt Filter Components (Batch 2 - Filters)

**Files:**
- Copy: `FilterBar.tsx`
- Copy: `FilterDropdown.tsx`
- Copy: `TeamFilter.tsx`

- [ ] **Step 1: Copy FilterBar.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\FilterBar.tsx" .
```

- [ ] **Step 2: Copy FilterDropdown.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\FilterDropdown.tsx" .
```

- [ ] **Step 3: Copy TeamFilter.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\TeamFilter.tsx" .
```

- [ ] **Step 4: Check for Zustand store imports**

Open each file and verify:
- `FilterDropdown.tsx` likely imports from a Zustand store
- Check the store path: should be something like `../../store` or `../store`
- Note the store location for later creation if needed

- [ ] **Step 5: Update main index.ts**

Add to exports:

```typescript
export { FilterBar } from './FilterBar';
export { FilterDropdown } from './FilterDropdown';
export { TeamFilter } from './TeamFilter';
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/Filter*.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/TeamFilter.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/index.ts
git commit -m "chore: copy filter components (FilterBar, FilterDropdown, TeamFilter)"
```

---

## Task 5: Copy and Adapt Accordion Components (Batch 3 - Hierarchy)

**Files:**
- Copy: `BusinessUnitAccordion.tsx`
- Copy: `DepartmentAccordion.tsx`
- Copy: `PositionAccordion.tsx`
- Copy: `PositionRow.tsx`

- [ ] **Step 1: Copy BusinessUnitAccordion.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\BusinessUnitAccordion.tsx" .
```

- [ ] **Step 2: Copy DepartmentAccordion.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\DepartmentAccordion.tsx" .
```

- [ ] **Step 3: Copy PositionAccordion.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\PositionAccordion.tsx" .
```

- [ ] **Step 4: Copy PositionRow.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\PositionRow.tsx" .
```

- [ ] **Step 5: Verify color classes in all 4 files**

Check for Tailwind colors:
- `bg-gray-900`, `bg-blue-50`, `border-gray-200` should already be in current data_report
- Verify no old blue-500 colors remain

- [ ] **Step 6: Update main index.ts**

Add to exports:

```typescript
export { BusinessUnitAccordion } from './BusinessUnitAccordion';
export { DepartmentAccordion } from './DepartmentAccordion';
export { PositionAccordion } from './PositionAccordion';
export { PositionRow } from './PositionRow';
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/*Accordion.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/PositionRow.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/index.ts
git commit -m "chore: copy accordion components (hierarchy structure)"
```

---

## Task 6: Copy and Adapt Tab and Summary Components (Batch 4 - Tabs)

**Files:**
- Copy: `CurrentOpeningsTab.tsx`
- Copy: `HistoricalAnalyticsPage.tsx`
- Copy: `HistoricalTabQueryForm.tsx`
- Copy: `SummaryCards.tsx`

- [ ] **Step 1: Copy CurrentOpeningsTab.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\CurrentOpeningsTab.tsx" .
```

- [ ] **Step 2: Copy HistoricalAnalyticsPage.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\HistoricalAnalyticsPage.tsx" .
```

- [ ] **Step 3: Copy HistoricalTabQueryForm.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\HistoricalTabQueryForm.tsx" .
```

- [ ] **Step 4: Copy SummaryCards.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\SummaryCards.tsx" .
```

- [ ] **Step 5: Check for modal/date picker dependencies**

Open these files and check:
- `HistoricalTabQueryForm.tsx`: May import date-fns or react-datepicker
- `HistoricalAnalyticsPage.tsx`: May import from `./ResultsModal`
- Verify all imports are relative and will work

- [ ] **Step 6: Update main index.ts**

Add to exports:

```typescript
export { CurrentOpeningsTab } from './CurrentOpeningsTab';
export { HistoricalAnalyticsPage } from './HistoricalAnalyticsPage';
export { HistoricalTabQueryForm } from './HistoricalTabQueryForm';
export { SummaryCards } from './SummaryCards';
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/*Tab*.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/*Query*.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/SummaryCards.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/index.ts
git commit -m "chore: copy tab and query components"
```

---

## Task 7: Copy and Adapt Chart Components (Batch 5 - Charts)

**Files:**
- Copy: `DonutChart.tsx`
- Copy: `PipelineFlowChart.tsx`
- Copy: `ResultsModal.tsx`
- Copy: `PipelineVisualizationTabs.tsx`
- Copy: `PositionPipelineVisualization.tsx`

- [ ] **Step 1: Copy DonutChart.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\DonutChart.tsx" .
```

- [ ] **Step 2: Copy PipelineFlowChart.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\PipelineFlowChart.tsx" .
```

- [ ] **Step 3: Copy ResultsModal.tsx (Has Solace colors updated)**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\ResultsModal.tsx" .
```

Verify this file has the updated Solace chart colors:
- `primary: '#F05A22'` (VNG Orange)
- `secondary: '#A259FF'` (Mystic Violet)
- `success: '#1A9E5F'` (Mint Green)
- etc.

- [ ] **Step 4: Copy PipelineVisualizationTabs.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\PipelineVisualizationTabs.tsx" .
```

- [ ] **Step 5: Copy PositionPipelineVisualization.tsx**

```bash
copy "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components\PositionPipelineVisualization.tsx" .
```

- [ ] **Step 6: Verify Recharts imports**

Open all 5 files and verify:
- `import { BarChart, PieChart, ... } from 'recharts'`
- These libraries are already in Solace's package.json

- [ ] **Step 7: Update main index.ts**

Add to exports:

```typescript
export { DonutChart } from './DonutChart';
export { PipelineFlowChart } from './PipelineFlowChart';
export { ResultsModal } from './ResultsModal';
export { PipelineVisualizationTabs } from './PipelineVisualizationTabs';
export { PositionPipelineVisualization } from './PositionPipelineVisualization';
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/*Chart.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/ResultsModal.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/*Visualization*.tsx
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/index.ts
git commit -m "chore: copy chart and visualization components with Solace colors"
```

---

## Task 8: Create HiringDashboardPage Wrapper Component

**Files:**
- Create: `pages/HiringDashboardPage.tsx`

- [ ] **Step 1: Create the page component**

```typescript
// frontend/src/modules/reports-analytics/pages/HiringDashboardPage.tsx

import React, { useState } from 'react';
import {
  CurrentOpeningsTab,
  HistoricalAnalyticsPage,
} from '../components/HiringDashboardTab';

type Tab = 'current' | 'historical';

export const HiringDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('current');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'current'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Current Opening Positions
        </button>
        <button
          onClick={() => setActiveTab('historical')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'historical'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Historical Data
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'current' && <CurrentOpeningsTab />}
        {activeTab === 'historical' && <HistoricalAnalyticsPage />}
      </div>
    </div>
  );
};

export default HiringDashboardPage;
```

- [ ] **Step 2: Verify component structure**

The component should:
- Import CurrentOpeningsTab and HistoricalAnalyticsPage
- Manage tab state
- Render tab buttons
- Conditionally render active tab content

- [ ] **Step 3: Check for Solace color compatibility**

Update tab navigation colors if needed:
- Change `text-blue-600` to Solace orange: `text-[Solace orange]`
- Change `border-blue-600` to Solace orange border
- Verify text colors match Solace palette

- [ ] **Step 4: Commit**

```bash
git add frontend/src/modules/reports-analytics/pages/HiringDashboardPage.tsx
git commit -m "feat: create HiringDashboardPage wrapper component"
```

---

## Task 9: Update ReportsLayout to Include HiringDashboardTab

**Files:**
- Modify: `ReportsLayout.tsx` (add new tab option)

- [ ] **Step 1: Open ReportsLayout.tsx**

```bash
cat frontend/src/modules/reports-analytics/ReportsLayout.tsx | head -50
```

Examine the current structure to understand:
- How tabs are defined
- How routing works
- What parameters are used

- [ ] **Step 2: Add HiringDashboardPage to imports**

In ReportsLayout.tsx, add:

```typescript
import HiringDashboardPage from './pages/HiringDashboardPage';
```

- [ ] **Step 3: Add tab definition (if using switch/case)**

Locate the tab switching logic (likely a switch statement or conditional renders).

Add a case for hiring dashboard:

```typescript
case 'hiring':
  return <HiringDashboardPage />;
```

Or if using a tab list structure, add:

```typescript
{ id: 'hiring', label: 'Hiring Dashboard', component: HiringDashboardPage }
```

- [ ] **Step 4: Verify ReportsLayout renders correctly**

No changes needed to the layout wrapper itself - just the routing.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/reports-analytics/ReportsLayout.tsx
git commit -m "chore: add HiringDashboardPage to ReportsLayout"
```

---

## Task 10: Update API Integration Points

**Files:**
- Modify: `api.ts` (add hiring dashboard endpoints, or note if using mock data)

- [ ] **Step 1: Check data_report data source**

In data_report, check:
- Are components using mock data (from state/Zustand)?
- Or are they expecting API calls?

```bash
grep -r "fetch\|axios\|api" "C:\Users\LAP14052\Downloads\AI Project\datareport feature\data_report\src\components" | head -20
```

- [ ] **Step 2: If using mock data, no API changes needed**

If components import mock data directly, no changes to Solace api.ts are needed yet.
This can be deferred to Phase 4 (Integration).

- [ ] **Step 3: If using API calls, add endpoint stubs**

If data_report components call API endpoints, add stubs to `frontend/src/modules/reports-analytics/api.ts`:

```typescript
// Hiring Dashboard endpoints
export async function getHiringPositions() {
  // TODO: Implement real API call in Phase 4
  return [];
}

export async function getHiringMetrics() {
  // TODO: Implement real API call in Phase 4
  return {};
}
```

- [ ] **Step 4: Commit (if changes made)**

```bash
git add frontend/src/modules/reports-analytics/api.ts
git commit -m "chore: add hiring dashboard API endpoint stubs"
```

---

## Task 11: Create Component Exports Index

**Files:**
- Modify: `components/HiringDashboardTab/index.ts` (complete exports)

- [ ] **Step 1: Verify all exports are in index.ts**

Open `components/HiringDashboardTab/index.ts` and ensure it exports:

```typescript
// UI Components
export { Badge } from './Badge';
export { Card } from './Card';
export { ExpandCollapseControls } from './ExpandCollapseControls';
export { RejectionPopover } from './RejectionPopover';

// Filters
export { FilterBar } from './FilterBar';
export { FilterDropdown } from './FilterDropdown';
export { TeamFilter } from './TeamFilter';

// Accordion Components
export { BusinessUnitAccordion } from './BusinessUnitAccordion';
export { DepartmentAccordion } from './DepartmentAccordion';
export { PositionAccordion } from './PositionAccordion';
export { PositionRow } from './PositionRow';

// Tabs and Forms
export { CurrentOpeningsTab } from './CurrentOpeningsTab';
export { HistoricalAnalyticsPage } from './HistoricalAnalyticsPage';
export { HistoricalTabQueryForm } from './HistoricalTabQueryForm';
export { SummaryCards } from './SummaryCards';

// Charts
export { DonutChart } from './DonutChart';
export { PipelineFlowChart } from './PipelineFlowChart';
export { ResultsModal } from './ResultsModal';
export { PipelineVisualizationTabs } from './PipelineVisualizationTabs';
export { PositionPipelineVisualization } from './PositionPipelineVisualization';

// Hooks
export * from './hooks';

// Utils
export * from './utils';

// Data
export * from './data';
```

- [ ] **Step 2: Verify hooks/index.ts exports**

```typescript
export { useSummaryMetrics } from './useSummaryMetrics';
```

- [ ] **Step 3: Verify utils/index.ts exports**

```typescript
export * from './dataTransformUtils';
```

- [ ] **Step 4: Verify data/index.ts exports**

```typescript
export * from './mockData';
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/index.ts
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/hooks/index.ts
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/utils/index.ts
git add frontend/src/modules/reports-analytics/components/HiringDashboardTab/data/index.ts
git commit -m "chore: complete component and utility exports for HiringDashboardTab"
```

---

## Task 12: TypeScript Build Verification

**Files:**
- No files to create/modify
- Verify build succeeds

- [ ] **Step 1: Run TypeScript type check in Solace**

```bash
cd "C:\Users\LAP14052\Downloads\AI Project\AIT Project\VNGG-ATS\frontend"
npm run type-check
# or
tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: If type errors found, document them**

Common issues:
- Missing type imports from Solace shared types
- Mismatched function signatures
- Missing utility functions

- [ ] **Step 3: Run linter if available**

```bash
npm run lint
# or
npx eslint src/modules/reports-analytics/components/HiringDashboardTab --fix
```

- [ ] **Step 4: Commit (if any type fixes made)**

```bash
git commit -m "fix: resolve TypeScript type errors in HiringDashboardTab migration"
```

---

## Task 13: Build and Verify Migration

**Files:**
- No files to modify
- Verify build succeeds and no runtime errors

- [ ] **Step 1: Build Solace frontend**

```bash
cd "C:\Users\LAP14052\Downloads\AI Project\AIT Project\VNGG-ATS\frontend"
npm run build
```

Expected: Build completes successfully with no errors

- [ ] **Step 2: Check for unused variables or imports**

```bash
npm run lint -- --fix
```

- [ ] **Step 3: Verify bundle size**

Check if bundle size is reasonable (should be < 500KB gzipped increase)

- [ ] **Step 4: Run any smoke tests**

```bash
npm run test -- --run
```

- [ ] **Step 5: Document any issues found**

If issues found, note them for Phase 4 (Integration testing).

- [ ] **Step 6: Commit build success**

```bash
git commit -m "chore: verify Phase 3 migration builds successfully"
```

---

## Task 14: Create Migration Summary Document

**Files:**
- Create: `MIGRATION_PHASE3_SUMMARY.md`

- [ ] **Step 1: Create summary document**

```markdown
# Phase 3: Component Migration - Summary

## Completed Tasks

- [x] Created HiringDashboardTab folder structure
- [x] Copied utilities, hooks, and mock data
- [x] Copied 20+ components from data_report
- [x] Created HiringDashboardPage wrapper
- [x] Updated ReportsLayout routing
- [x] Verified TypeScript compilation
- [x] Verified build succeeds

## Components Migrated

### Foundation (4)
- Badge.tsx
- Card.tsx
- ExpandCollapseControls.tsx
- RejectionPopover.tsx

### Filters (3)
- FilterBar.tsx
- FilterDropdown.tsx
- TeamFilter.tsx

### Accordion/Hierarchy (4)
- BusinessUnitAccordion.tsx
- DepartmentAccordion.tsx
- PositionAccordion.tsx
- PositionRow.tsx

### Tabs & Forms (4)
- CurrentOpeningsTab.tsx
- HistoricalAnalyticsPage.tsx
- HistoricalTabQueryForm.tsx
- SummaryCards.tsx

### Charts & Visualizations (5)
- DonutChart.tsx
- PipelineFlowChart.tsx
- ResultsModal.tsx (with Solace colors)
- PipelineVisualizationTabs.tsx
- PositionPipelineVisualization.tsx

### Utilities & Hooks
- dataTransformUtils.ts
- useSummaryMetrics.ts
- mockData.ts

## Solace Color Mappings Applied

✅ All components use Solace color palette:
- Header: VNG Black (#0D0D0D)
- Accent: VNG Orange (#F05A22)
- P1 Badge: Danger Red (#D23B3B)
- P2 Badge: Amber (#FF9B1E)
- Charts: Full Solace palette applied

## Known Limitations (for Phase 4)

1. **Data Source**: Currently using mock data from data_report
   - Phase 4: Replace with real Solace API endpoints

2. **Authentication**: Inherits Solace auth context
   - Will work automatically with Solace session

3. **Responsive Design**: Tested on desktop
   - Should verify on mobile/tablet in Phase 4

4. **Dark Mode**: If Solace supports it, may need theme adjustments
   - Current colors assume light mode

## Files Created in Solace

```
frontend/src/modules/reports-analytics/
├── components/HiringDashboardTab/ (NEW FOLDER)
│   ├── index.ts
│   ├── [20+ .tsx component files]
│   ├── hooks/
│   │   ├── index.ts
│   │   └── useSummaryMetrics.ts
│   ├── utils/
│   │   ├── index.ts
│   │   └── dataTransformUtils.ts
│   └── data/
│       ├── index.ts
│       └── mockData.ts
└── pages/
    └── HiringDashboardPage.tsx (NEW)
```

## Build Status

✅ TypeScript compilation: PASS
✅ ESLint: PASS (or auto-fixed)
✅ npm run build: SUCCESS
✅ Bundle size: OK

## Next Phase

Phase 4 will:
1. Integrate with Solace backend API endpoints
2. Update mock data with real data calls
3. Add integration tests
4. Verify responsive design and dark mode support
5. Test navigation and routing

---

**Completed:** 2026-10-09
**Status:** ✅ PHASE 3 COMPLETE
```

- [ ] **Step 2: Commit summary**

```bash
git add MIGRATION_PHASE3_SUMMARY.md
git commit -m "docs: add Phase 3 migration completion summary"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] All 20+ components copied to HiringDashboardTab
- [ ] HiringDashboardPage created and exported
- [ ] ReportsLayout updated with HiringDashboardPage
- [ ] All imports use relative paths correctly
- [ ] TypeScript compilation succeeds (no errors)
- [ ] npm run build completes successfully
- [ ] No console warnings about missing components
- [ ] Component exports in index.ts are complete
- [ ] Solace colors applied (verified in source)
- [ ] All files committed to git

---

**Execution Strategy:**

Plan complete and saved to implementation file. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task with detailed instructions, review between tasks, fast iteration and independent task execution

**2. Inline Execution** - Execute tasks in this session using executing-plans, with batched task execution and progress checkpoints

**Which approach would you prefer?**


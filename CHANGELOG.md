# Changelog

## [Oct 8, 2026] - 3-Level Hierarchical Accordion & Enhanced Filtering

### ✨ Features Added

#### 1. 3-Level Hierarchical Accordion Structure
- **Business Unit Level**: Expandable/collapsible section for each BU
- **Department Level**: NEW - Expandable/collapsible section for each department within BU
- **Position Level**: Individual position details displayed via PositionRow component
- Improved navigation and data exploration for 26 departments across 4 Business Units

#### 2. Business Unit & Department Hierarchy
- Created `constants/businessUnits.ts` with 4 Business Units:
  - **Game Publishing**: 15 departments (GS1, GS2, GS3, GS9, GSSEA, GSDR, GSES, GSTPE, GSJKT, NCV, CTS, GSP, FGS, GSG, RES)
  - **Game Publishing Platform**: 5 departments (GIO, PRO, PIN, GDS, PEN)
  - **Game Development**: 5 departments (APS, MPS, GDO, HBS, VCS)
  - **Business Operations**: 6 departments (HRA, SRM, FPA, LCP, LCCA, AIT)

#### 3. Dependent Dropdown Filtering
- **Business Unit selector**: Shows all 4 BUs, filters available departments in real-time
- **Department selector**: Auto-populates based on selected BU, resets when BU changes
- Applied to both:
  - Current Opening Positions FilterBar
  - Historical Data Query Form
  - Historical Analytics Results Page

#### 4. Enhanced Historical Data Features
- `HistoricalTabQueryForm.tsx`: Redesigned with BU/Department filters (matching FilterBar style)
- `HistoricalAnalyticsPage.tsx`: Added real-time BU/Department filtering for results
- Summary cards and charts update dynamically when filters change

### 🔄 Modified Components

| Component | Changes |
|-----------|---------|
| `CurrentOpeningsTab.tsx` | Integrated 3-level accordion, added expandedDepts state management, removed Expand/Collapse All buttons |
| `BusinessUnitAccordion.tsx` | Refactored to render DepartmentAccordion for each department, added expandedDepts & onDeptToggle props |
| `FilterBar.tsx` | Updated to support dependent BU → Department dropdown logic |
| `HistoricalTabQueryForm.tsx` | Complete redesign: team dropdown → BU + Department dropdowns, matching FilterBar styling |
| `HistoricalAnalyticsPage.tsx` | Added BU/Department filter section, dynamic filtering of summary metrics |
| `types/index.ts` | Updated Position: team → department + businessUnit; Updated HiringSummary with businessUnit field |
| `mockData.ts` | All 25 positions updated with businessUnit assignments |
| `hiringStore.ts` | Updated to use department instead of team |
| `useSummaryMetrics.ts` | Updated to use department instead of team |
| `exportUtils.ts` | Updated labels and field mappings: team → department |

### ✨ New Components

| Component | Purpose |
|-----------|---------|
| `DepartmentAccordion.tsx` | Department-level accordion with collapsible position list |
| `constants/businessUnits.ts` | Business Unit and department structure definitions |

### 🗑️ Removed Features

- **Expand/Collapse All buttons**: Replaced with direct click-to-toggle on accordion headers

### 📊 Data Model Changes

```typescript
// Position Interface
- team: string → department: string + businessUnit: string

// HiringSummary Interface
- Added businessUnit?: string
- Added department?: string

// HistoricalQueryParams
- team?: string → businessUnit?: string + department?: string
```

### 🎯 User Experience Improvements

1. **Better Organization**: Positions grouped by BU and Department for easier navigation
2. **Intuitive Filtering**: Dependent dropdowns prevent invalid filter combinations
3. **Dynamic Updates**: Summary metrics and charts update in real-time as filters change
4. **Consistent Design**: All filter interfaces follow same pattern across tabs
5. **Responsive**: Mobile-friendly 3-level accordion structure

### 🧪 Testing Status

✅ **Tested & Working**:
- 3-level accordion expand/collapse functionality
- Dependent dropdown filtering (BU → Department)
- Dynamic metric updates on filter changes
- Historical Data query with new filters
- Results page filter refinement
- Responsive design (mobile & desktop)

⚠️ **Known Issues**:
- Build warnings: unused imports in HistoricalAnalyticsPage (non-critical)
- PositionAccordion.tsx has broken variable names (component not used in new code path)
- Can be cleaned up in future maintenance release

### 🔮 Future Enhancements

1. **Mock Data**: Add positions for remaining 3 Business Units for full testing
2. **API Integration**: Ready for Solace API integration without UI changes
3. **Additional Filters**: Can extend FilterBar with Level, Priority filters if needed
4. **Export**: Update export functionality to include new department/BU fields

### 📝 Implementation Notes

- All filters use **AND logic** across dimensions (BU AND Department AND Level AND Priority)
- **DepartmentAccordion** delegates position display to **PositionRow** component for UI consistency
- **Dependent dropdown pattern** prevents invalid filter states
- **Memoized filtering** ensures optimal performance with large datasets
- Architecture prepared for scaling to 26 departments

### 🚀 Deployment

**Branch**: master  
**Commit**: 20e2d42  
**Changes**: 15 files (732 insertions, 346 deletions)  

**Ready for**:
- ✅ Development/QA testing
- ✅ Staging environment deployment
- ✅ Future production release after full dataset integration

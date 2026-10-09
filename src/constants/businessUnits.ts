export interface BusinessUnit {
  code: string;
  label: string;
  departments: readonly string[];
}

export const UNASSIGNED_BU: BusinessUnit = {
  code: "UNASSIGNED",
  label: "Unassigned",
  departments: [],
};

export const BUSINESS_UNITS: readonly BusinessUnit[] = [
  {
    code: "game_publishing",
    label: "Game Publishing",
    departments: ["GS1", "GS2", "GS3", "GS9", "GSSEA", "GSDR", "GSES", "GSTPE", "GSJKT", "NCV", "CTS", "GSP", "FGS", "GSG", "RES"],
  },
  {
    code: "game_publishing_platform",
    label: "Game Publishing Platform",
    departments: ["GIO", "PRO", "PIN", "GDS", "PEN"],
  },
  {
    code: "game_development",
    label: "Game Development",
    departments: ["APS", "MPS", "GDO", "HBS", "VCS"],
  },
  {
    code: "business_operations",
    label: "Business Operations",
    departments: ["HRA", "SRM", "FPA", "LCP", "LCCA", "AIT"],
  },
];

const norm = (s: string | null | undefined): string => (s ?? "").trim().toUpperCase();

const deptToBu = new Map<string, BusinessUnit>();
for (const bu of BUSINESS_UNITS) {
  for (const d of bu.departments) deptToBu.set(norm(d), bu);
}

export const buForDepartment = (department: string | null | undefined): BusinessUnit =>
  deptToBu.get(norm(department)) ?? UNASSIGNED_BU;

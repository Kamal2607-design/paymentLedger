import { Box } from "@mui/material";

const tabButtonSx = (selected) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  px: 0,
  py: 1,
  mr: 3,
  border: "none",
  borderBottom: selected ? "2px solid #6E0ACE" : "2px solid transparent",
  background: "none",
  cursor: "pointer",
  fontFamily: "DM Sans, sans-serif",
  fontSize: "16px",
  fontWeight: 600,
  color: selected ? "#6E0ACE" : "#64748B",
});

const countBadgeSx = (selected) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 22,
  height: 22,
  px: 0.75,
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
  backgroundColor: selected ? "#F8F0FF" : "#F1F5F9",
  color: selected ? "#6E0ACE" : "#64748B",
});

/** Underlined tabs with count badges (CRM payments "Completed / Dues" style). */
const TypeTabs = ({ tabs, value, onChange }) => (
  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", mt: 1 }}>
    {tabs.map((tab) => {
      const selected = tab.value === value;
      return (
        <Box key={tab.label} component="button" type="button" onClick={() => onChange(tab.value)} sx={tabButtonSx(selected)}>
          {tab.label}
          {tab.count !== undefined && (
            <Box component="span" sx={countBadgeSx(selected)}>
              {tab.count}
            </Box>
          )}
        </Box>
      );
    })}
  </Box>
);

export default TypeTabs;

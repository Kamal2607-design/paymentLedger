import { Box, Skeleton, Typography } from "@mui/material";

const cardSx = {
  minWidth: 0,
  px: 2.5,
  py: 2,
  borderRadius: "12px",
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 1.5,
};

/** Bordered stat cards, same look as the CRM payments summary. */
const SummaryCards = ({ cards, loading = false, columns = 4 }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: `repeat(${columns}, minmax(0, 1fr))` },
      gap: 2,
      width: "100%",
      mb: 2.5,
    }}>
    {cards.map((card) => (
      <Box key={card.label} sx={cardSx}>
        <Box sx={{ minWidth: 0 }}>
          {loading ? (
            <>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={140} height={40} sx={{ mt: 0.5 }} />
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", color: "#64748B", mb: 1 }}>
                {card.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 24, md: 26 },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: card.color || "#111827",
                  letterSpacing: "-0.02em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={typeof card.value === "string" ? card.value : undefined}>
                {card.value}
              </Typography>
              {card.caption && (
                <Typography sx={{ fontSize: 12, color: "#64748B", mt: 0.75 }}>{card.caption}</Typography>
              )}
            </>
          )}
        </Box>
        {card.icon && (
          <Box
            sx={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: card.iconBg || "rgba(150, 49, 245, 0.15)",
              color: card.color || "#6E0ACE",
            }}>
            {card.icon}
          </Box>
        )}
      </Box>
    ))}
  </Box>
);

export default SummaryCards;

import { Avatar, Box, Typography } from "@mui/material";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import { formatCurrency, getInitials } from "@/utils/format";

const TYPE_STYLES = {
  credit: { bg: "#D1FAE5", color: "#118D57", label: "Credit", Icon: ArrowDownwardRoundedIcon },
  debit: { bg: "#FEE2E2", color: "#DC2626", label: "Debit", Icon: ArrowUpwardRoundedIcon },
};

export const TypeChip = ({ type }) => {
  const style = TYPE_STYLES[type];
  if (!style) return null;
  const { Icon } = style;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.25,
        height: 26,
        borderRadius: "36px",
        bgcolor: style.bg,
        color: style.color,
        fontSize: "0.75rem",
        fontWeight: 600,
      }}>
      <Icon sx={{ fontSize: 14 }} />
      {style.label}
    </Box>
  );
};

export const SignedAmount = ({ type, amount, sx = {} }) => (
  <Typography
    component="span"
    sx={{ fontWeight: 700, fontSize: "0.9rem", color: type === "credit" ? "#118D57" : "#DC2626", ...sx }}>
    {type === "credit" ? "+ " : "- "}
    {formatCurrency(amount)}
  </Typography>
);

const AVATAR_COLORS = [
  ["#F8F0FF", "#6E0ACE"],
  ["#E6F6FF", "#0351AB"],
  ["#E8FFF3", "#118D57"],
  ["#FEF3C7", "#D97706"],
  ["#FFE0E0", "#DC2626"],
];

export const AccountAvatar = ({ id = 0, name, size = 32 }) => {
  const [bg, fg] = AVATAR_COLORS[Number(id) % AVATAR_COLORS.length];
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: bg, color: fg, fontSize: size * 0.4, fontWeight: 700 }}>
      {getInitials(name)}
    </Avatar>
  );
};

export const AccountCell = ({ id, name, size }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, height: "100%" }}>
    <AccountAvatar id={id} name={name} size={size} />
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#14181D", lineHeight: 1.2 }} noWrap>
        {name}
      </Typography>
      <Typography sx={{ fontSize: "0.75rem", color: "#64748B", lineHeight: 1.2 }}>#{id}</Typography>
    </Box>
  </Box>
);

export const SectionCard = ({ title, action, children, sx = {} }) => (
  <Box
    sx={{
      backgroundColor: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: "12px",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      p: 2.5,
      minWidth: 0,
      ...sx,
    }}>
    {(title || action) && (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</Typography>
        {action}
      </Box>
    )}
    {children}
  </Box>
);

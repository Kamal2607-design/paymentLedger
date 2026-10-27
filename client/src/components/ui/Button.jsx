import { Button as MUIButton, CircularProgress } from "@mui/material";
import theme from "@/theme";

const Button = ({
  children,
  startIcon,
  endIcon,
  onClick,
  type = "button",
  size = "large",
  disabled = false,
  loading = false,
  backgroundColor = theme.palette.primary.medium,
  variant = "outline",
  sx = {},
  ...rest
}) => {
  const filled = variant !== "outline";

  return (
    <MUIButton
      size={size}
      disabled={disabled || loading}
      type={type}
      variant={filled ? "contained" : "outlined"}
      startIcon={loading ? <CircularProgress size={16} sx={{ color: filled ? "#fff" : backgroundColor }} /> : startIcon}
      endIcon={endIcon}
      onClick={onClick}
      sx={{
        backgroundColor: filled ? backgroundColor : "#fff",
        color: filled ? "#fff" : backgroundColor,
        fontWeight: 600,
        textTransform: "none",
        border: "1px solid",
        borderColor: backgroundColor,
        boxShadow: "none",
        borderRadius: "8px",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        "&:hover": {
          backgroundColor: filled ? backgroundColor : "#F8F0FF",
          borderColor: backgroundColor,
          boxShadow: "none",
          opacity: filled ? 0.92 : 1,
        },
        "&.Mui-disabled": {
          backgroundColor: filled ? "#C9B3E6" : "#fff",
          color: filled ? "#fff" : "#AFBACA",
          borderColor: filled ? "#C9B3E6" : "#E2E8F0",
        },
        ...sx,
      }}
      {...rest}>
      {children}
    </MUIButton>
  );
};

export default Button;

import { Box, IconButton, Modal as MuiModal, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Button from "./Button";

/**
 * CRM-style modal. When `onSubmit` is given the body is a <form>, so Enter
 * submits and the primary button is a real submit button.
 */
const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  btnName = "Save",
  isSubmitting = false,
  isDisabled = false,
  width = 480,
}) => (
  <MuiModal open={open} onClose={isSubmitting ? undefined : onClose} aria-labelledby="modal-title">
    <Box
      component={onSubmit ? "form" : "div"}
      onSubmit={onSubmit}
      noValidate
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "calc(100% - 32px)", sm: width },
        maxHeight: "90vh",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 3,
        borderRadius: "8px 8px 32px 8px",
        outline: "none",
        display: "flex",
        flexDirection: "column",
      }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
        <Box>
          <Typography id="modal-title" variant="h5" sx={{ color: "#111827" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isSubmitting} aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", pt: 0.5 }}>{children}</Box>

      {onSubmit && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={isSubmitting} disabled={isDisabled}>
            {btnName}
          </Button>
        </Box>
      )}
    </Box>
  </MuiModal>
);

export default Modal;

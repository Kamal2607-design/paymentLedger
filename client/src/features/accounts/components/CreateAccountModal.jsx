import { Box, TextField, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import { createAccount } from "@/services/ledgerService";
import { handleFormError, muiField } from "@/utils/formErrors";
import { useStore } from "@/store";

const CreateAccountModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const bumpRefresh = useStore((s) => s.bumpRefresh);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: "" } });

  const onSubmit = async ({ name }) => {
    try {
      const res = await createAccount({ name: name.trim() });
      toast.success(`Account #${res.data.id} created for ${res.data.name}`);
      bumpRefresh();
      onClose();
      navigate(`/accounts/${res.data.id}`);
    } catch (error) {
      handleFormError(error, setError, { name: "name" });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Account"
      subtitle="Open a new ledger account"
      onSubmit={handleSubmit(onSubmit)}
      btnName="Create Account"
      isSubmitting={isSubmitting}>
      <TextField
        label="Account holder name"
        fullWidth
        autoFocus
        {...muiField(register, "name", {
          validate: (v) => (v.trim() ? true : "Name is required"),
          maxLength: { value: 100, message: "Name must be at most 100 characters" },
        })}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />
      <Box sx={{ display: "flex", gap: 1, mt: 2, p: 1.5, borderRadius: "8px", backgroundColor: "#F8F0FF" }}>
        <InfoOutlinedIcon sx={{ fontSize: 18, color: "#6E0ACE", mt: "1px" }} />
        <Typography variant="body2" sx={{ color: "#455468" }}>
          Every account starts with a balance of ₹0.00. Add a credit transaction to fund it.
        </Typography>
      </Box>
    </Modal>
  );
};

export default CreateAccountModal;

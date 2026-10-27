import { useEffect, useState } from "react";
import { Box, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import AccountPicker from "@/components/ui/AccountPicker";
import { createTransfer, getAccount } from "@/services/ledgerService";
import { formatCurrency, generateReference } from "@/utils/format";
import { AMOUNT_PATTERN, amountRules, handleFormError, muiField } from "@/utils/formErrors";
import { useStore } from "@/store";

const TransferModal = ({ open, onClose, fromAccountId }) => {
  const bumpRefresh = useStore((s) => s.bumpRefresh);
  const [loadingSource, setLoadingSource] = useState(Boolean(fromAccountId));
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      from: null,
      to: null,
      amount: "",
      description: "",
      reference_id: generateReference("XFER"),
    },
  });

  useEffect(() => {
    if (!fromAccountId) return;
    getAccount(fromAccountId)
      .then((res) => reset((values) => ({ ...values, from: res.data })))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingSource(false));
  }, [fromAccountId, reset]);

  const [from, to, amount] = watch(["from", "to", "amount"]);
  const validAmount = AMOUNT_PATTERN.test(String(amount).trim()) && Number(amount) > 0;
  const insufficient = from && validAmount && Number(amount) > from.balance;

  const onSubmit = async (values) => {
    try {
      const res = await createTransfer({
        from_account_id: values.from.id,
        to_account_id: values.to.id,
        amount: Number(values.amount),
        description: values.description.trim() || null,
        reference_id: values.reference_id.trim(),
      });
      toast.success(
        `Transferred ${formatCurrency(res.data.amount)} from ${res.data.fromAccount.name} to ${res.data.toAccount.name}`,
      );
      bumpRefresh();
      onClose();
    } catch (error) {
      handleFormError(error, setError, {
        amount: "amount",
        description: "description",
        reference_id: "reference_id",
        from_account_id: "from",
        to_account_id: "to",
        SAME_ACCOUNT_TRANSFER: "to",
        INSUFFICIENT_BALANCE: "amount",
        DUPLICATE_TRANSFER: "reference_id",
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transfer Money"
      subtitle="Debit one account and credit another in a single atomic operation"
      onSubmit={handleSubmit(onSubmit)}
      btnName="Transfer"
      isSubmitting={isSubmitting}
      isDisabled={loadingSource}
      width={520}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        <Controller
          name="from"
          control={control}
          rules={{ required: "Select the source account" }}
          render={({ field }) => (
            <AccountPicker
              label="From account"
              value={field.value}
              onChange={field.onChange}
              excludeId={to?.id}
              disabled={Boolean(fromAccountId)}
              error={Boolean(errors.from)}
              helperText={errors.from?.message || (from ? `Available: ${formatCurrency(from.balance)}` : " ")}
            />
          )}
        />

        <Box sx={{ display: "flex", justifyContent: "center", mt: -1.5, mb: -1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F8F0FF",
              color: "#6E0ACE",
            }}>
            <SouthRoundedIcon fontSize="small" />
          </Box>
        </Box>

        <Controller
          name="to"
          control={control}
          rules={{
            required: "Select the destination account",
            validate: (value) => !from || !value || value.id !== from.id || "Choose a different account",
          }}
          render={({ field }) => (
            <AccountPicker
              label="To account"
              value={field.value}
              onChange={field.onChange}
              excludeId={from?.id}
              error={Boolean(errors.to)}
              helperText={errors.to?.message}
            />
          )}
        />

        <TextField
          label="Amount"
          fullWidth
          {...muiField(register, "amount", amountRules)}
          error={Boolean(errors.amount) || Boolean(insufficient)}
          helperText={errors.amount?.message || (insufficient ? "Amount exceeds the source account balance" : " ")}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
            htmlInput: { inputMode: "decimal" },
          }}
        />

        <TextField
          label="Reference ID"
          fullWidth
          {...muiField(register, "reference_id", {
            validate: (v) => (v.trim() ? true : "Reference ID is required"),
            maxLength: { value: 100, message: "Reference ID must be at most 100 characters" },
          })}
          error={Boolean(errors.reference_id)}
          helperText={errors.reference_id?.message || "Unique per source account"}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Generate new reference">
                    <IconButton size="small" onClick={() => setValue("reference_id", generateReference("XFER"))}>
                      <AutorenewRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="Description (optional)"
          fullWidth
          {...muiField(register, "description", { maxLength: { value: 255, message: "At most 255 characters" } })}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
        />

        {from && to && validAmount && !insufficient && (
          <Typography variant="body2" sx={{ color: "#455468", textAlign: "center" }}>
            {from.name} will be debited and {to.name} credited with{" "}
            <strong>{formatCurrency(amount)}</strong>.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default TransferModal;

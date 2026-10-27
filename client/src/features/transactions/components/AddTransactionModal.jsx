import { useEffect, useMemo, useState } from "react";
import { Box, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import AccountPicker from "@/components/ui/AccountPicker";
import { createTransaction, getAccount } from "@/services/ledgerService";
import { formatCurrency, generateReference } from "@/utils/format";
import { AMOUNT_PATTERN, amountRules, handleFormError, muiField } from "@/utils/formErrors";
import { useStore } from "@/store";

const TYPE_OPTIONS = [
  { value: "credit", label: "Credit", color: "#118D57", bg: "#E8FFF3" },
  { value: "debit", label: "Debit", color: "#DC2626", bg: "#FFE0E0" },
];

const typeButtonSx = (option, selected) => ({
  flex: 1,
  height: 44,
  borderRadius: "8px",
  border: `1px solid ${selected ? option.color : "#E2E8F0"}`,
  backgroundColor: selected ? option.bg : "#FFFFFF",
  color: selected ? option.color : "#455468",
  fontFamily: "DM Sans, sans-serif",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
});

const AddTransactionModal = ({ open, onClose, accountId, type: initialType = "credit" }) => {
  const bumpRefresh = useStore((s) => s.bumpRefresh);
  const [accountLoading, setAccountLoading] = useState(Boolean(accountId));
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
      account: null,
      type: initialType,
      amount: "",
      description: "",
      reference_id: generateReference("TXN"),
    },
  });

  useEffect(() => {
    if (!accountId) return;
    getAccount(accountId)
      .then((res) => reset((values) => ({ ...values, account: res.data })))
      .catch((err) => toast.error(err.message))
      .finally(() => setAccountLoading(false));
  }, [accountId, reset]);

  const [account, type, amount] = watch(["account", "type", "amount"]);

  const projection = useMemo(() => {
    if (!account || !AMOUNT_PATTERN.test(String(amount).trim()) || Number(amount) <= 0) return null;
    const delta = type === "credit" ? Number(amount) : -Number(amount);
    return { current: account.balance, next: Math.round((account.balance + delta) * 100) / 100 };
  }, [account, type, amount]);

  const onSubmit = async (values) => {
    try {
      const res = await createTransaction({
        account_id: values.account.id,
        type: values.type,
        amount: Number(values.amount),
        description: values.description.trim() || null,
        reference_id: values.reference_id.trim(),
      });
      toast.success(
        `${values.type === "credit" ? "Credited" : "Debited"} ${formatCurrency(res.data.amount)} — new balance ${formatCurrency(res.data.balance_after)}`,
      );
      bumpRefresh();
      onClose();
    } catch (error) {
      handleFormError(error, setError, {
        amount: "amount",
        description: "description",
        reference_id: "reference_id",
        account_id: "account",
        ACCOUNT_NOT_FOUND: "account",
        INSUFFICIENT_BALANCE: "amount",
        DUPLICATE_TRANSACTION: "reference_id",
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Transaction"
      subtitle="Post a credit or debit to an account"
      onSubmit={handleSubmit(onSubmit)}
      btnName={type === "credit" ? "Credit Account" : "Debit Account"}
      isSubmitting={isSubmitting}
      isDisabled={accountLoading}
      width={520}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        <Controller
          name="account"
          control={control}
          rules={{ required: "Select an account" }}
          render={({ field }) => (
            <AccountPicker
              label="Account"
              value={field.value}
              onChange={field.onChange}
              disabled={Boolean(accountId)}
              error={Boolean(errors.account)}
              helperText={errors.account?.message}
            />
          )}
        />

        <Box sx={{ display: "flex", gap: 1.5 }}>
          {TYPE_OPTIONS.map((option) => (
            <Box
              key={option.value}
              component="button"
              type="button"
              onClick={() => setValue("type", option.value)}
              sx={typeButtonSx(option, type === option.value)}>
              {option.label}
            </Box>
          ))}
        </Box>

        <TextField
          label="Amount"
          fullWidth
          {...muiField(register, "amount", amountRules)}
          error={Boolean(errors.amount)}
          helperText={errors.amount?.message}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
            htmlInput: { inputMode: "decimal" },
          }}
        />

        {projection && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: "8px",
              backgroundColor: projection.next < 0 ? "#FEE2E2" : "#F8FAFC",
              border: `1px solid ${projection.next < 0 ? "#FECACA" : "#E9EFF6"}`,
            }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#64748B" }}>Current balance</Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatCurrency(projection.current)}</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 12, color: "#64748B" }}>Balance after</Typography>
              <Typography sx={{ fontWeight: 700, color: projection.next < 0 ? "#DC2626" : "#118D57" }}>
                {projection.next < 0 ? "Insufficient balance" : formatCurrency(projection.next)}
              </Typography>
            </Box>
          </Box>
        )}

        <TextField
          label="Reference ID"
          fullWidth
          {...muiField(register, "reference_id", {
            validate: (v) => (v.trim() ? true : "Reference ID is required"),
            maxLength: { value: 100, message: "Reference ID must be at most 100 characters" },
          })}
          error={Boolean(errors.reference_id)}
          helperText={errors.reference_id?.message || "Unique per account. Re-using it is rejected as a duplicate."}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Generate new reference">
                    <IconButton size="small" onClick={() => setValue("reference_id", generateReference("TXN"))}>
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
          multiline
          minRows={2}
          {...muiField(register, "description", { maxLength: { value: 255, message: "At most 255 characters" } })}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
        />
      </Box>
    </Modal>
  );
};

export default AddTransactionModal;

import { toast } from "react-toastify";

/**
 * Maps an API error onto react-hook-form fields where possible and toasts the rest.
 * `fieldMap` translates API field names and error codes to form field names;
 * anything not in the map is shown as a toast.
 */
export const handleFormError = (error, setError, fieldMap = {}) => {
  let applied = false;

  for (const item of error.errors || []) {
    const field = fieldMap[item.field];
    if (field) {
      setError(field, { type: "server", message: item.message });
      applied = true;
    }
  }

  const codeField = fieldMap[error.errCode];
  if (!applied && codeField) {
    setError(codeField, { type: "server", message: error.message });
    applied = true;
  }

  if (error.errCode === "DUPLICATE_TRANSACTION" || error.errCode === "DUPLICATE_TRANSFER") {
    toast.warning(error.message);
  } else if (!applied) {
    toast.error(error.message);
  }
};

/** react-hook-form register() for MUI TextField: the ref must reach the <input>, not the wrapper div. */
export const muiField = (register, name, rules) => {
  const { ref, ...rest } = register(name, rules);
  return { ...rest, inputRef: ref };
};

export const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export const amountRules = {
  required: "Amount is required",
  validate: (value) => {
    const trimmed = String(value).trim();
    if (!AMOUNT_PATTERN.test(trimmed)) return "Enter a valid amount with up to 2 decimals";
    if (Number(trimmed) <= 0) return "Amount must be greater than 0";
    if (Number(trimmed) > 1_000_000_000) return "Amount must not exceed 1,000,000,000";
    return true;
  },
};

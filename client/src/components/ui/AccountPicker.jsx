import { useEffect, useMemo, useState } from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { listAccounts } from "@/services/ledgerService";
import { formatCurrency } from "@/utils/format";
import { AccountAvatar } from "./LedgerBits";

/** Searchable account selector backed by GET /accounts?search=. */
const AccountPicker = ({ label, value, onChange, error, helperText, excludeId, disabled, size = "medium" }) => {
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      listAccounts({ search: input, limit: 20 })
        .then((res) => active && setOptions(res.data.accounts))
        .catch(() => active && setOptions([]))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [input]);

  const filtered = useMemo(() => options.filter((o) => o.id !== excludeId), [options, excludeId]);

  return (
    <Autocomplete
      value={value}
      onChange={(_, next) => onChange(next)}
      onInputChange={(_, next, reason) => reason === "input" && setInput(next)}
      options={value && !filtered.some((o) => o.id === value.id) ? [value, ...filtered] : filtered}
      getOptionLabel={(o) => `${o.name} (#${o.id})`}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      filterOptions={(x) => x}
      loading={loading}
      disabled={disabled}
      size={size}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest} sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
            <AccountAvatar id={option.id} name={option.name} size={28} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>
                {option.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#64748B" }}>#{option.id}</Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#455468" }}>{formatCurrency(option.balance)}</Typography>
          </Box>
        );
      }}
      renderInput={(params) => <TextField {...params} label={label} error={error} helperText={helperText} />}
    />
  );
};

export default AccountPicker;

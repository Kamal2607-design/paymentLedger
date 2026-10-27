import { useEffect, useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

/** Applies the search on Enter (or when cleared), like the CRM payments filter bar. */
const SearchField = ({ value = "", onSearch, placeholder = "Search", sx = {} }) => {
  const [input, setInput] = useState(value);

  useEffect(() => setInput(value), [value]);

  return (
    <TextField
      placeholder={placeholder}
      size="small"
      value={input}
      onChange={(e) => {
        setInput(e.target.value);
        if (!e.target.value.trim()) onSearch("");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSearch(input.trim());
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: input ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  setInput("");
                  onSearch("");
                }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
          sx: { height: 40, borderRadius: "8px", bgcolor: "#FFFFFF" },
        },
      }}
      sx={{ flex: 1, minWidth: 220, ...sx }}
    />
  );
};

export default SearchField;

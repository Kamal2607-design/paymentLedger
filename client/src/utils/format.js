import { format } from "date-fns";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactInr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatCurrency = (value) => inr.format(Number(value || 0));

export const formatCompactCurrency = (value) => compactInr.format(Number(value || 0));

export const formatDateTime = (value) => (value ? format(new Date(value), "dd MMM yyyy, hh:mm a") : "—");

export const formatDate = (value) => (value ? format(new Date(value), "dd MMM yyyy") : "—");

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

/** Client-generated idempotency key; reused if the same form is submitted twice. */
export const generateReference = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/** Browser timezone as minutes east of UTC (IST = 330). */
export const tzOffsetMinutes = () => -new Date().getTimezoneOffset();

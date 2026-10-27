import api from "@/utils/api";

const clean = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export const getDashboardSummary = (tzOffset) => api.get("/dashboard/summary", { params: { tz_offset: tzOffset } });

export const listAccounts = (params = {}) => api.get("/accounts", { params: clean(params) });
export const getAccount = (id) => api.get(`/accounts/${id}`);
export const getAccountBalance = (id) => api.get(`/accounts/${id}/balance`);
export const createAccount = (payload) => api.post("/accounts", payload);
export const getAccountTransactions = (id, params = {}) =>
  api.get(`/accounts/${id}/transactions`, { params: clean(params) });

export const listTransactions = (params = {}) => api.get("/transactions", { params: clean(params) });
export const createTransaction = (payload) => api.post("/transactions", payload);

export const listTransfers = (params = {}) => api.get("/transfers", { params: clean(params) });
export const createTransfer = (payload) => api.post("/transfers", payload);

export const getHealth = () => api.get("/health");

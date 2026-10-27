import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Normalise every failure into { status, errCode, message, errors, data }.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        status: 0,
        errCode: "NETWORK_ERROR",
        message: "Cannot reach the ledger API. Is the server running?",
      });
    }
    const body = error.response.data || {};
    return Promise.reject({
      status: error.response.status,
      errCode: body.errCode,
      message: body.errorMessage || "Something went wrong",
      errors: body.errors,
      data: body.data,
    });
  },
);

export default api;

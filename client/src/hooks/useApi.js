import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useStore } from "@/store";

/**
 * Runs `request` whenever `deps` (or the global refreshKey) change.
 * Keeps the previous data while reloading so tables don't flash empty.
 */
const useApi = (request, deps = []) => {
  const refreshKey = useStore((s) => s.refreshKey);
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true }));
    request()
      .then((res) => active && setState({ data: res.data, loading: false, error: null }))
      .catch((error) => {
        if (!active) return;
        setState((prev) => ({ ...prev, loading: false, error }));
        if (error.status !== 404) toast.error(error.message, { toastId: error.message });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refreshKey]);

  return state;
};

export default useApi;

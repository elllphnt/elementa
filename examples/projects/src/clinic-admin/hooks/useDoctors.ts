import { useCallback } from "react";
import { apiClient } from "../api/client.js";
import { useAppContext } from "../store/context.tsx";

export function useDoctors() {
  const { state, dispatch } = useAppContext();

  const fetchDoctors = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: { key: "doctors", value: true } });
    dispatch({ type: "SET_ERROR", payload: { key: "doctors", value: null } });

    try {
      const response = await apiClient.getDoctors();
      dispatch({ type: "SET_DOCTORS", payload: response.data });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: {
          key: "doctors",
          value:
            error instanceof Error ? error.message : "Failed to fetch doctors",
        },
      });
    } finally {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "doctors", value: false },
      });
    }
  }, [dispatch]);

  return {
    doctors: state.doctors,
    loading: state.loading.doctors,
    error: state.errors.doctors,
    fetchDoctors,
  };
}

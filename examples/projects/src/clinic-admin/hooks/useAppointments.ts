import { useCallback } from "react";
import { apiClient } from "../api/client.js";
import { useAppContext } from "../store/context.tsx";
import { Appointment } from "../types/index.js";

export function useAppointments() {
  const { state, dispatch } = useAppContext();

  const fetchAppointments = useCallback(
    async (page = 1, limit = 10, filters = {}) => {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "appointments", value: true },
      });
      dispatch({
        type: "SET_ERROR",
        payload: { key: "appointments", value: null },
      });

      try {
        const response = await apiClient.getAppointments(page, limit, filters);
        dispatch({ type: "SET_APPOINTMENTS", payload: response.data });
        dispatch({
          type: "SET_PAGINATION",
          payload: {
            key: "appointments",
            value: response.pagination,
          },
        });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "appointments",
            value:
              error instanceof Error
                ? error.message
                : "Failed to fetch appointments",
          },
        });
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "appointments", value: false },
        });
      }
    },
    [dispatch]
  );

  const createAppointment = useCallback(
    async (
      appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">
    ) => {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "appointments", value: true },
      });
      dispatch({
        type: "SET_ERROR",
        payload: { key: "appointments", value: null },
      });

      try {
        const response = await apiClient.createAppointment(appointmentData);
        dispatch({ type: "ADD_APPOINTMENT", payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "appointments",
            value:
              error instanceof Error
                ? error.message
                : "Failed to create appointment",
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "appointments", value: false },
        });
      }
    },
    [dispatch]
  );

  const updateAppointment = useCallback(
    async (id: string, appointmentData: Partial<Appointment>) => {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "appointments", value: true },
      });
      dispatch({
        type: "SET_ERROR",
        payload: { key: "appointments", value: null },
      });

      try {
        const response = await apiClient.updateAppointment(id, appointmentData);
        dispatch({ type: "UPDATE_APPOINTMENT", payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "appointments",
            value:
              error instanceof Error
                ? error.message
                : "Failed to update appointment",
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "appointments", value: false },
        });
      }
    },
    [dispatch]
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "appointments", value: true },
      });
      dispatch({
        type: "SET_ERROR",
        payload: { key: "appointments", value: null },
      });

      try {
        await apiClient.deleteAppointment(id);
        dispatch({ type: "DELETE_APPOINTMENT", payload: id });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "appointments",
            value:
              error instanceof Error
                ? error.message
                : "Failed to delete appointment",
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "appointments", value: false },
        });
      }
    },
    [dispatch]
  );

  return {
    appointments: state.appointments,
    loading: state.loading.appointments,
    error: state.errors.appointments,
    pagination: state.pagination.appointments,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
}

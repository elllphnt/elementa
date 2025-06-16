import { useCallback } from "react";
import { apiClient } from "../api/client.js";
import { useAppContext } from "../store/context.js";
import { Patient } from "../types/index.js";

export function usePatients() {
  const { state, dispatch } = useAppContext();

  const fetchPatients = useCallback(
    async (page = 1, limit = 10, search = "") => {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "patients", value: true },
      });
      dispatch({
        type: "SET_ERROR",
        payload: { key: "patients", value: null },
      });

      try {
        const response = await apiClient.getPatients(page, limit, search);
        dispatch({ type: "SET_PATIENTS", payload: response.data });
        dispatch({
          type: "SET_PAGINATION",
          payload: {
            key: "patients",
            value: response.pagination,
          },
        });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "patients",
            value:
              error instanceof Error
                ? error.message
                : "Failed to fetch patients",
          },
        });
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "patients", value: false },
        });
      }
    },
    [dispatch]
  );

  const createPatient = useCallback(
    async (patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">) => {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "patients", value: true },
      });
      dispatch({
        type: "SET_ERROR",
        payload: { key: "patients", value: null },
      });

      try {
        const response = await apiClient.createPatient(patientData);
        dispatch({ type: "ADD_PATIENT", payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "patients",
            value:
              error instanceof Error
                ? error.message
                : "Failed to create patient",
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "patients", value: false },
        });
      }
    },
    [dispatch]
  );

  const updatePatient = useCallback(
    async (id: string, patientData: Partial<Patient>) => {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "patients", value: true },
      });
      dispatch({
        type: "SET_ERROR",
        payload: { key: "patients", value: null },
      });

      try {
        const response = await apiClient.updatePatient(id, patientData);
        dispatch({ type: "UPDATE_PATIENT", payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "patients",
            value:
              error instanceof Error
                ? error.message
                : "Failed to update patient",
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "patients", value: false },
        });
      }
    },
    [dispatch]
  );

  const deletePatient = useCallback(
    async (id: string) => {
      dispatch({
        type: "SET_LOADING",
        payload: { key: "patients", value: true },
      });
      dispatch({
        type: "SET_ERROR",
        payload: { key: "patients", value: null },
      });

      try {
        await apiClient.deletePatient(id);
        dispatch({ type: "DELETE_PATIENT", payload: id });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "patients",
            value:
              error instanceof Error
                ? error.message
                : "Failed to delete patient",
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "patients", value: false },
        });
      }
    },
    [dispatch]
  );

  return {
    patients: state.patients,
    loading: state.loading.patients,
    error: state.errors.patients,
    pagination: state.pagination.patients,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
}

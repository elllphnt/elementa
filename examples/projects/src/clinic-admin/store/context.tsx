import React, { createContext, ReactNode, useContext, useReducer } from "react";
import { Appointment, Doctor, Patient, User } from "../types/index.js";

interface AppState {
  user: User | null;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  loading: {
    patients: boolean;
    doctors: boolean;
    appointments: boolean;
    auth: boolean;
  };
  errors: {
    patients: string | null;
    doctors: string | null;
    appointments: string | null;
    auth: string | null;
  };
  pagination: {
    patients: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    appointments: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_PATIENTS"; payload: Patient[] }
  | { type: "ADD_PATIENT"; payload: Patient }
  | { type: "UPDATE_PATIENT"; payload: Patient }
  | { type: "DELETE_PATIENT"; payload: string }
  | { type: "SET_DOCTORS"; payload: Doctor[] }
  | { type: "SET_APPOINTMENTS"; payload: Appointment[] }
  | { type: "ADD_APPOINTMENT"; payload: Appointment }
  | { type: "UPDATE_APPOINTMENT"; payload: Appointment }
  | { type: "DELETE_APPOINTMENT"; payload: string }
  | {
      type: "SET_LOADING";
      payload: { key: keyof AppState["loading"]; value: boolean };
    }
  | {
      type: "SET_ERROR";
      payload: { key: keyof AppState["errors"]; value: string | null };
    }
  | {
      type: "SET_PAGINATION";
      payload: { key: keyof AppState["pagination"]; value: any };
    }
  | { type: "CLEAR_ERRORS" };

const initialState: AppState = {
  user: null,
  patients: [],
  doctors: [],
  appointments: [],
  loading: {
    patients: false,
    doctors: false,
    appointments: false,
    auth: false,
  },
  errors: {
    patients: null,
    doctors: null,
    appointments: null,
    auth: null,
  },
  pagination: {
    patients: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    appointments: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_PATIENTS":
      return { ...state, patients: action.payload };

    case "ADD_PATIENT":
      return { ...state, patients: [...state.patients, action.payload] };

    case "UPDATE_PATIENT":
      return {
        ...state,
        patients: state.patients.map((patient) =>
          patient.id === action.payload.id ? action.payload : patient
        ),
      };

    case "DELETE_PATIENT":
      return {
        ...state,
        patients: state.patients.filter(
          (patient) => patient.id !== action.payload
        ),
      };

    case "SET_DOCTORS":
      return { ...state, doctors: action.payload };

    case "SET_APPOINTMENTS":
      return { ...state, appointments: action.payload };

    case "ADD_APPOINTMENT":
      return {
        ...state,
        appointments: [...state.appointments, action.payload],
      };

    case "UPDATE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.map((appointment) =>
          appointment.id === action.payload.id ? action.payload : appointment
        ),
      };

    case "DELETE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.filter(
          (appointment) => appointment.id !== action.payload
        ),
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value },
      };

    case "SET_PAGINATION":
      return {
        ...state,
        pagination: {
          ...state.pagination,
          [action.payload.key]: action.payload.value,
        },
      };

    case "CLEAR_ERRORS":
      return {
        ...state,
        errors: {
          patients: null,
          doctors: null,
          appointments: null,
          auth: null,
        },
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

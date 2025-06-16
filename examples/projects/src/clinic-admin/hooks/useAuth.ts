import { useCallback } from "react";
import { apiClient } from "../api/client.js";
import { useAppContext } from "../store/context.tsx";

export function useAuth() {
  const { state, dispatch } = useAppContext();

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch({ type: "SET_LOADING", payload: { key: "auth", value: true } });
      dispatch({ type: "SET_ERROR", payload: { key: "auth", value: null } });

      try {
        const response = await apiClient.login(email, password);
        const { user, token } = response.data;

        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({ type: "SET_USER", payload: user });
        return user;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            key: "auth",
            value: error instanceof Error ? error.message : "Login failed",
          },
        });
        throw error;
      } finally {
        dispatch({
          type: "SET_LOADING",
          payload: { key: "auth", value: false },
        });
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      dispatch({ type: "SET_USER", payload: null });
    }
  }, [dispatch]);

  const initializeAuth = useCallback(() => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({ type: "SET_USER", payload: user });
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  return {
    user: state.user,
    loading: state.loading.auth,
    error: state.errors.auth,
    isAuthenticated: !!state.user,
    login,
    logout,
    initializeAuth,
  };
}

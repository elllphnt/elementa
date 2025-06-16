import {
  ApiResponse,
  Appointment,
  Doctor,
  PaginatedResponse,
  Patient,
} from "../types/index.js";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Patient API
  async getPatients(
    page = 1,
    limit = 10,
    search = ""
  ): Promise<PaginatedResponse<Patient>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return this.request(`/patients?${params}`);
  }

  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    return this.request(`/patients/${id}`);
  }

  async createPatient(
    patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Patient>> {
    return this.request("/patients", {
      method: "POST",
      body: JSON.stringify(patient),
    });
  }

  async updatePatient(
    id: string,
    patient: Partial<Patient>
  ): Promise<ApiResponse<Patient>> {
    return this.request(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(patient),
    });
  }

  async deletePatient(id: string): Promise<ApiResponse<void>> {
    return this.request(`/patients/${id}`, {
      method: "DELETE",
    });
  }

  // Doctor API
  async getDoctors(): Promise<ApiResponse<Doctor[]>> {
    return this.request("/doctors");
  }

  async getDoctor(id: string): Promise<ApiResponse<Doctor>> {
    return this.request(`/doctors/${id}`);
  }

  // Appointment API
  async getAppointments(
    page = 1,
    limit = 10,
    filters = {}
  ): Promise<PaginatedResponse<Appointment>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return this.request(`/appointments?${params}`);
  }

  async getAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(
    appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Appointment>> {
    return this.request("/appointments", {
      method: "POST",
      body: JSON.stringify(appointment),
    });
  }

  async updateAppointment(
    id: string,
    appointment: Partial<Appointment>
  ): Promise<ApiResponse<Appointment>> {
    return this.request(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(appointment),
    });
  }

  async deleteAppointment(id: string): Promise<ApiResponse<void>> {
    return this.request(`/appointments/${id}`, {
      method: "DELETE",
    });
  }

  // Auth API
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: any; token: string }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();

import { useEffect, useState } from "react";
import { Appointment, AppointmentFormData } from "../types/index.js";

const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data
  const mockAppointments: Appointment[] = [
    {
      id: "1",
      patientId: "1",
      doctorId: "1",
      date: "2024-12-20",
      time: "09:00",
      duration: 30,
      status: "scheduled",
      type: "consultation",
      notes: "Regular checkup",
      symptoms: ["Headache", "Fatigue"],
      createdAt: "2024-12-15T10:30:00Z",
      updatedAt: "2024-12-15T10:30:00Z",
    },
    {
      id: "2",
      patientId: "2",
      doctorId: "2",
      date: "2024-12-21",
      time: "14:30",
      duration: 45,
      status: "confirmed",
      type: "follow-up",
      notes: "Follow-up on asthma treatment",
      symptoms: ["Shortness of breath"],
      createdAt: "2024-12-16T09:15:00Z",
      updatedAt: "2024-12-16T09:15:00Z",
    },
  ];

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAppointments(mockAppointments);
    } catch (err) {
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (
    appointmentData: AppointmentFormData
  ): Promise<Appointment> => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newAppointment: Appointment = {
        ...appointmentData,
        id: (appointments.length + 1).toString(),
        duration: 30,
        status: "scheduled",
        diagnosis: undefined,
        prescription: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError("Failed to create appointment");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    id: string,
    status: Appointment["status"]
  ) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status, updatedAt: new Date().toISOString() }
            : appointment
        )
      );
    } catch (err) {
      setError("Failed to update appointment status");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentById = (id: string): Appointment | undefined => {
    return appointments.find((a) => a.id === id);
  };

  const getAppointmentsByPatientId = (patientId: string): Appointment[] => {
    return appointments.filter((a) => a.patientId === patientId);
  };

  const getUpcomingAppointments = (): Appointment[] => {
    const today = new Date();
    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= today && appointment.status !== "cancelled";
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    getAppointmentById,
    getAppointmentsByPatientId,
    getUpcomingAppointments,
  };
};

export default useAppointments;

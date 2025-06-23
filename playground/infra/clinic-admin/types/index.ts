// Core types for the clinic admin application

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  department: string;
  availableSlots: TimeSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  type: "consultation" | "follow-up" | "surgery" | "checkup";
  notes: string;
  symptoms: string[];
  diagnosis?: string;
  prescription?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  date: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "doctor" | "nurse" | "receptionist";
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: Appointment["type"];
  notes: string;
  symptoms: string[];
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Extended interfaces with joined data
export interface AppointmentWithDetails extends Appointment {
  patient: Patient;
  doctor: Doctor;
}

export interface PatientWithAppointments extends Patient {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
}

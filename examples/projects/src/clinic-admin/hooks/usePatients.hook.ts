import { useEffect, useState } from "react";
import { Patient, PatientFormData } from "../types/index.js";

const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockPatients: Patient[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "+1-555-0123",
      dateOfBirth: "1985-03-15",
      address: "123 Main St, City, State 12345",
      medicalHistory: ["Hypertension", "Diabetes Type 2"],
      emergencyContact: {
        name: "Jane Doe",
        phone: "+1-555-0124",
        relationship: "Spouse",
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1-555-0125",
      dateOfBirth: "1992-07-22",
      address: "456 Oak Ave, City, State 12345",
      medicalHistory: ["Asthma"],
      emergencyContact: {
        name: "Michael Johnson",
        phone: "+1-555-0126",
        relationship: "Brother",
      },
      createdAt: "2024-01-16T09:15:00Z",
      updatedAt: "2024-01-16T09:15:00Z",
    },
  ];

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPatients(mockPatients);
    } catch (err) {
      setError("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (
    patientData: PatientFormData
  ): Promise<Patient> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newPatient: Patient = {
        ...patientData,
        id: (patients.length + 1).toString(),
        medicalHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPatients((prev) => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      setError("Failed to create patient");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (
    id: string,
    patientData: Partial<PatientFormData>
  ): Promise<Patient> => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedPatient = patients.find((p) => p.id === id);
      if (!updatedPatient) {
        throw new Error("Patient not found");
      }
      const updated: Patient = {
        ...updatedPatient,
        ...patientData,
        updatedAt: new Date().toISOString(),
      };
      setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      setError("Failed to update patient");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPatientById = (id: string): Patient | undefined => {
    return patients.find((p) => p.id === id);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    getPatientById,
  };
};

export default usePatients;

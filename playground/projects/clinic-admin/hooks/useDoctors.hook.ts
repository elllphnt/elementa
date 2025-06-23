import { useEffect, useState } from "react";
import { Doctor } from "../types/index.js";

const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data
  const mockDoctors: Doctor[] = [
    {
      id: "1",
      firstName: "Dr. Emily",
      lastName: "Watson",
      email: "emily.watson@clinic.com",
      phone: "+1-555-0200",
      specialization: "Cardiology",
      licenseNumber: "MD-12345",
      department: "Cardiology",
      availableSlots: [],
      createdAt: "2024-01-01T08:00:00Z",
      updatedAt: "2024-01-01T08:00:00Z",
    },
    {
      id: "2",
      firstName: "Dr. Michael",
      lastName: "Chen",
      email: "michael.chen@clinic.com",
      phone: "+1-555-0201",
      specialization: "Pulmonology",
      licenseNumber: "MD-12346",
      department: "Pulmonology",
      availableSlots: [],
      createdAt: "2024-01-01T08:00:00Z",
      updatedAt: "2024-01-01T08:00:00Z",
    },
    {
      id: "3",
      firstName: "Dr. Sarah",
      lastName: "Rodriguez",
      email: "sarah.rodriguez@clinic.com",
      phone: "+1-555-0202",
      specialization: "Pediatrics",
      licenseNumber: "MD-12347",
      department: "Pediatrics",
      availableSlots: [],
      createdAt: "2024-01-01T08:00:00Z",
      updatedAt: "2024-01-01T08:00:00Z",
    },
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setDoctors(mockDoctors);
    } catch (err) {
      setError("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const getDoctorById = (id: string): Doctor | undefined => {
    return doctors.find((d) => d.id === id);
  };

  const getDoctorsBySpecialization = (specialization: string): Doctor[] => {
    return doctors.filter((d) =>
      d.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    getDoctorById,
    getDoctorsBySpecialization,
  };
};

export default useDoctors;

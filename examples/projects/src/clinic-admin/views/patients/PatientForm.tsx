import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button.tsx";
import { Input, Select, Textarea } from "../../components/ui/Form.tsx";
import { usePatients } from "../../hooks/usePatients.ts";
import styles from "../../styles/PatientForm.module.css";
import { Patient } from "../../types/index.js";

export function PatientForm() {
  const navigate = useNavigate();
  const { createPatient, loading } = usePatients();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    medicalHistory: [] as string[],
    allergies: [] as string[],
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  const [tempMedicalHistory, setTempMedicalHistory] = useState("");
  const [tempAllergy, setTempAllergy] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addMedicalHistory = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tempMedicalHistory.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, tempMedicalHistory.trim()],
      }));
      setTempMedicalHistory("");
    }
  };

  const removeMedicalHistory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index),
    }));
  };

  const addAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tempAllergy.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, tempAllergy.trim()],
      }));
      setTempAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.emergencyContact.name.trim()) {
      newErrors["emergencyContact.name"] = "Emergency contact name is required";
    }
    if (!formData.emergencyContact.phone.trim()) {
      newErrors["emergencyContact.phone"] =
        "Emergency contact phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createPatient(
        formData as Omit<Patient, "id" | "createdAt" | "updatedAt">
      );
      setMessage("Patient created successfully!");
      setTimeout(() => {
        navigate("/patients");
      }, 1000);
    } catch (error) {
      setMessage("Failed to create patient. Please try again.");
    }
  };

  const relationshipOptions = [
    { value: "", label: "Select relationship" },
    { value: "spouse", label: "Spouse" },
    { value: "parent", label: "Parent" },
    { value: "child", label: "Child" },
    { value: "sibling", label: "Sibling" },
    { value: "friend", label: "Friend" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className={styles.patientForm}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Patient</h1>
        <p className={styles.subtitle}>
          Enter the patient's information below to add them to the system.
        </p>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formCard}>
          {message && (
            <div
              className={
                message.includes("successfully")
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <div className={styles.formGrid}>
                <Input
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={errors.firstName}
                  required
                />
                <Input
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={errors.lastName}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                />
                <Input
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                  required
                />
                <Input
                  type="date"
                  name="dateOfBirth"
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  error={errors.dateOfBirth}
                  required
                />
              </div>
              <div className={styles.formGridFull}>
                <Textarea
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Medical Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGridFull}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical History
                  </label>
                  <Input
                    type="text"
                    placeholder="Type and press Enter to add"
                    value={tempMedicalHistory}
                    onChange={(e) => setTempMedicalHistory(e.target.value)}
                    onKeyDown={addMedicalHistory}
                  />
                  <div className={styles.tagsInput}>
                    {formData.medicalHistory.map((item, index) => (
                      <span key={index} className={styles.tag}>
                        {item}
                        <button
                          type="button"
                          onClick={() => removeMedicalHistory(index)}
                          className={styles.tagRemove}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.formGridFull}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <Input
                    type="text"
                    placeholder="Type and press Enter to add"
                    value={tempAllergy}
                    onChange={(e) => setTempAllergy(e.target.value)}
                    onKeyDown={addAllergy}
                  />
                  <div className={styles.tagsInput}>
                    {formData.allergies.map((item, index) => (
                      <span key={index} className={styles.tag}>
                        {item}
                        <button
                          type="button"
                          onClick={() => removeAllergy(index)}
                          className={styles.tagRemove}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Emergency Contact</h2>
              <div className={styles.emergencyContactSection}>
                <div className={styles.formGrid}>
                  <Input
                    name="emergencyContact.name"
                    label="Contact Name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    error={errors["emergencyContact.name"]}
                    required
                  />
                  <Input
                    type="tel"
                    name="emergencyContact.phone"
                    label="Contact Phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    error={errors["emergencyContact.phone"]}
                    required
                  />
                  <Select
                    name="emergencyContact.relationship"
                    label="Relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    options={relationshipOptions}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/patients")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Patient"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

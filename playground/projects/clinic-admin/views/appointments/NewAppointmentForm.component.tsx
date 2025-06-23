import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout.component.js";
import useAppointments from "../../hooks/useAppointments.hook.js";
import useDoctors from "../../hooks/useDoctors.hook.js";
import usePatients from "../../hooks/usePatients.hook.js";
import { AppointmentFormData } from "../../types/index.js";

const NewAppointmentForm: React.FC = () => {
  const { createAppointment, loading } = useAppointments();
  const { patients } = usePatients();
  const { doctors } = useDoctors();

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    type: "consultation",
    notes: "",
    symptoms: [],
  });
  const [symptomInput, setSymptomInput] = useState("");
  const [errors, setErrors] = useState<Partial<AppointmentFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get URL parameters (e.g., ?patientId=123)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get("patientId");
    if (patientId) {
      setFormData((prev) => ({ ...prev, patientId }));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<AppointmentFormData> = {};

    if (!formData.patientId) newErrors.patientId = "Patient is required";
    if (!formData.doctorId) newErrors.doctorId = "Doctor is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.type) newErrors.type = "Appointment type is required";

    // Validate date is not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Appointment date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitError(null);
      await createAppointment(formData);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        patientId: "",
        doctorId: "",
        date: "",
        time: "",
        type: "consultation",
        notes: "",
        symptoms: [],
      });
      setSymptomInput("");
    } catch (error) {
      setSubmitError("Failed to create appointment. Please try again.");
    }
  };

  const handleInputChange = (
    field: keyof AppointmentFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const addSymptom = () => {
    if (
      symptomInput.trim() &&
      !formData.symptoms.includes(symptomInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()],
      }));
      setSymptomInput("");
    }
  };

  const removeSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.filter((s) => s !== symptom),
    }));
  };

  const handleSymptomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSymptom();
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (submitSuccess) {
    return (
      <Layout title="Schedule New Appointment">
        <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
          <div className="text-green-800 text-lg font-medium mb-2">
            Appointment Scheduled Successfully!
          </div>
          <p className="text-green-700 mb-4">
            The appointment has been added to the schedule.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setSubmitSuccess(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Schedule Another Appointment
            </button>
            <a
              href="/appointments"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              View All Appointments
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Schedule New Appointment">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-800">{submitError}</div>
                </div>
              )}

              {/* Patient Selection */}
              <div>
                <label
                  htmlFor="patientId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Patient *
                </label>
                <select
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) =>
                    handleInputChange("patientId", e.target.value)
                  }
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.patientId ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.email}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.patientId}
                  </p>
                )}
              </div>

              {/* Doctor Selection */}
              <div>
                <label
                  htmlFor="doctorId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Doctor *
                </label>
                <select
                  id="doctorId"
                  value={formData.doctorId}
                  onChange={(e) =>
                    handleInputChange("doctorId", e.target.value)
                  }
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.doctorId ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName} -{" "}
                      {doctor.specialization}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    min={today}
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.date ? "border-red-300" : ""
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.time ? "border-red-300" : ""
                    }`}
                  />
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Appointment Type */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Appointment Type *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    handleInputChange(
                      "type",
                      e.target.value as AppointmentFormData["type"]
                    )
                  }
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.type ? "border-red-300" : ""
                  }`}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="surgery">Surgery</option>
                  <option value="checkup">Check-up</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Symptoms */}
              <div>
                <label
                  htmlFor="symptoms"
                  className="block text-sm font-medium text-gray-700"
                >
                  Symptoms
                </label>
                <div className="mt-1">
                  <div className="flex">
                    <input
                      type="text"
                      id="symptoms"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      onKeyPress={handleSymptomKeyPress}
                      placeholder="Enter a symptom and press Enter"
                      className="flex-1 border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={addSymptom}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  {formData.symptoms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {symptom}
                          <button
                            type="button"
                            onClick={() => removeSymptom(symptom)}
                            className="ml-1 text-orange-600 hover:text-orange-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about the appointment..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <a
                  href="/appointments"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Scheduling..." : "Schedule Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewAppointmentForm;

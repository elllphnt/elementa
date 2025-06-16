import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout.component.js";
import usePatients from "../../hooks/usePatients.hook.js";
import { PatientFormData } from "../../types/index.js";

interface EditPatientFormProps {
  patientId: string;
}

const EditPatientForm: React.FC<EditPatientFormProps> = ({ patientId }) => {
  const { getPatientById, updatePatient, loading } = usePatients();
  const patient = getPatientById(patientId);

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });
  const [errors, setErrors] = useState<Partial<PatientFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
      });
    }
  }, [patient]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitError(null);
      await updatePatient(patientId, formData);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError("Failed to update patient. Please try again.");
    }
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
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

  const handleEmergencyContactChange = (
    field: keyof PatientFormData["emergencyContact"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  if (!patient) {
    return (
      <Layout title="Edit Patient">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Patient not found.</div>
          <a
            href="/patients"
            className="text-red-600 hover:text-red-800 underline mt-2 inline-block"
          >
            Back to Patients
          </a>
        </div>
      </Layout>
    );
  }

  if (submitSuccess) {
    return (
      <Layout title="Edit Patient">
        <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
          <div className="text-green-800 text-lg font-medium mb-2">
            Patient Updated Successfully!
          </div>
          <p className="text-green-700 mb-4">
            The patient information has been updated.
          </p>
          <div className="space-x-4">
            <a
              href={`/patients/${patientId}`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              View Patient Profile
            </a>
            <a
              href="/patients"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Patients
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit ${patient.firstName} ${patient.lastName}`}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-800">{submitError}</div>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.firstName ? "border-red-300" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.lastName ? "border-red-300" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.email ? "border-red-300" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.phone ? "border-red-300" : ""
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.dateOfBirth ? "border-red-300" : ""
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address *
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.address ? "border-red-300" : ""
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="emergencyName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Name
                    </label>
                    <input
                      type="text"
                      id="emergencyName"
                      value={formData.emergencyContact.name}
                      onChange={(e) =>
                        handleEmergencyContactChange("name", e.target.value)
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="emergencyPhone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="emergencyPhone"
                      value={formData.emergencyContact.phone}
                      onChange={(e) =>
                        handleEmergencyContactChange("phone", e.target.value)
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="emergencyRelationship"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Relationship
                    </label>
                    <input
                      type="text"
                      id="emergencyRelationship"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) =>
                        handleEmergencyContactChange(
                          "relationship",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <a
                  href={`/patients/${patientId}`}
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
                  {loading ? "Updating..." : "Update Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditPatientForm;

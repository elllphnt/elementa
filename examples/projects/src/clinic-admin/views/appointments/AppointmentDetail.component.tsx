import React, { useState } from "react";
import Layout from "../../components/Layout.component.js";
import useAppointments from "../../hooks/useAppointments.hook.js";
import useDoctors from "../../hooks/useDoctors.hook.js";
import usePatients from "../../hooks/usePatients.hook.js";

interface AppointmentDetailProps {
  appointmentId: string;
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  appointmentId,
}) => {
  const { getAppointmentById, updateAppointmentStatus } = useAppointments();
  const { getPatientById } = usePatients();
  const { getDoctorById } = useDoctors();

  const appointment = getAppointmentById(appointmentId);
  const patient = appointment ? getPatientById(appointment.patientId) : null;
  const doctor = appointment ? getDoctorById(appointment.doctorId) : null;

  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleStatusUpdate = async (
    newStatus: "confirmed" | "completed" | "cancelled"
  ) => {
    if (!appointment) return;

    setStatusUpdating(true);
    try {
      await updateAppointmentStatus(appointment.id, newStatus);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!appointment) {
    return (
      <Layout title="Appointment Not Found">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            Appointment with ID {appointmentId} not found.
          </div>
          <a
            href="/appointments"
            className="text-red-600 hover:text-red-800 underline mt-2 inline-block"
          >
            Back to Appointments
          </a>
        </div>
      </Layout>
    );
  }

  const formatDateTime = (date: string, time: string) => {
    const appointmentDate = new Date(`${date} ${time}`);
    return appointmentDate.toLocaleString();
  };

  const isUpcoming = () => {
    const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
    return appointmentDate > new Date();
  };

  const canConfirm = appointment.status === "scheduled";
  const canComplete =
    appointment.status === "scheduled" || appointment.status === "confirmed";
  const canCancel =
    appointment.status !== "cancelled" && appointment.status !== "completed";

  return (
    <Layout title="Appointment Details">
      <div className="max-w-4xl mx-auto">
        {/* Appointment Header */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {appointment.type.charAt(0).toUpperCase() +
                    appointment.type.slice(1)}{" "}
                  Appointment
                </h1>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    {formatDateTime(appointment.date, appointment.time)}
                  </span>
                  <span>•</span>
                  <span>{appointment.duration} minutes</span>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : appointment.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                {canConfirm && (
                  <button
                    onClick={() => handleStatusUpdate("confirmed")}
                    disabled={statusUpdating}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Confirm
                  </button>
                )}
                {canComplete && (
                  <button
                    onClick={() => handleStatusUpdate("completed")}
                    disabled={statusUpdating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Mark Complete
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={statusUpdating}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
                <a
                  href="/appointments"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Back to Appointments
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Patient Information
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {patient ? (
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <a
                        href={`/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {patient.firstName} {patient.lastName}
                      </a>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.email}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.phone}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </dd>
                  </div>
                  {patient.medicalHistory.length > 0 && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Medical History
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {patient.medicalHistory.map((condition, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <div className="px-4 py-5 text-gray-500">
                  Patient information not available
                </div>
              )}
            </div>
          </div>

          {/* Doctor Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Doctor Information
              </h3>
            </div>
            <div className="border-t border-gray-200">
              {doctor ? (
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {doctor.firstName} {doctor.lastName}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Specialization
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {doctor.specialization}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Department
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {doctor.department}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {doctor.email}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {doctor.phone}
                    </dd>
                  </div>
                </dl>
              ) : (
                <div className="px-4 py-5 text-gray-500">
                  Doctor information not available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Appointment Details
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Appointment Type
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                  {appointment.type}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Date & Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDateTime(appointment.date, appointment.time)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointment.duration} minutes
                </dd>
              </div>
              {appointment.notes && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.notes}
                  </dd>
                </div>
              )}
              {appointment.symptoms.length > 0 && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Symptoms
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {appointment.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
              {appointment.diagnosis && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Diagnosis
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.diagnosis}
                  </dd>
                </div>
              )}
              {appointment.prescription &&
                appointment.prescription.length > 0 && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Prescription
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="list-disc list-inside space-y-1">
                        {appointment.prescription.map((medication, index) => (
                          <li key={index}>{medication}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(appointment.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(appointment.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentDetail;

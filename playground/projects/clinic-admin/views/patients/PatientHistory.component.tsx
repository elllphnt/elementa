import React from "react";
import Layout from "../../components/Layout.component.js";
import useAppointments from "../../hooks/useAppointments.hook.js";
import useDoctors from "../../hooks/useDoctors.hook.js";
import usePatients from "../../hooks/usePatients.hook.js";

interface PatientHistoryProps {
  patientId: string;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ patientId }) => {
  const { getPatientById } = usePatients();
  const { getAppointmentsByPatientId } = useAppointments();
  const { getDoctorById } = useDoctors();

  const patient = getPatientById(patientId);
  const appointments = getAppointmentsByPatientId(patientId);

  // Sort appointments by date (most recent first)
  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const completedAppointments = sortedAppointments.filter(
    (apt) => apt.status === "completed"
  );
  const upcomingAppointments = sortedAppointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    const today = new Date();
    return aptDate >= today && apt.status !== "cancelled";
  });

  if (!patient) {
    return (
      <Layout title="Patient History">
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

  const getDoctorName = (doctorId: string) => {
    const doctor = getDoctorById(doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
  };

  return (
    <Layout
      title={`${patient.firstName} ${patient.lastName} - Medical History`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Patient Header */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xl font-medium">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </span>
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Patient ID: {patient.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <a
                  href={`/patients/${patient.id}`}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Back to Profile
                </a>
                <a
                  href={`/appointments/new?patientId=${patient.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Schedule Appointment
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Medical History Summary */}
        {patient.medicalHistory.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Medical Conditions
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {patient.medicalHistory.map((condition, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Appointment History */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upcoming Appointments
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="px-4 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {appointment.type}
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Date:</span>{" "}
                          {appointment.date} at {appointment.time}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Doctor:</span>{" "}
                          {getDoctorName(appointment.doctorId)}
                        </div>
                        {appointment.notes && (
                          <div className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span>{" "}
                            {appointment.notes}
                          </div>
                        )}
                        {appointment.symptoms.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">
                              Symptoms:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {appointment.symptoms.map((symptom, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Appointment History
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete record of past medical appointments
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {completedAppointments.length > 0 ? (
                completedAppointments.map((appointment) => (
                  <div key={appointment.id} className="px-4 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {appointment.type}
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {appointment.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Date:</span>{" "}
                          {appointment.date} at {appointment.time}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Doctor:</span>{" "}
                          {getDoctorName(appointment.doctorId)}
                        </div>
                        {appointment.notes && (
                          <div className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span>{" "}
                            {appointment.notes}
                          </div>
                        )}
                        {appointment.symptoms.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">
                              Symptoms:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {appointment.symptoms.map((symptom, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {appointment.diagnosis && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md">
                            <span className="text-sm font-medium text-blue-900">
                              Diagnosis:
                            </span>
                            <p className="text-sm text-blue-800 mt-1">
                              {appointment.diagnosis}
                            </p>
                          </div>
                        )}
                        {appointment.prescription &&
                          appointment.prescription.length > 0 && (
                            <div className="mt-2 p-3 bg-green-50 rounded-md">
                              <span className="text-sm font-medium text-green-900">
                                Prescription:
                              </span>
                              <ul className="text-sm text-green-800 mt-1 list-disc list-inside">
                                {appointment.prescription.map((med, index) => (
                                  <li key={index}>{med}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>
                          {new Date(appointment.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-12 text-center">
                  <div className="text-gray-500">
                    No completed appointments found
                  </div>
                  <p className="text-gray-400 mt-1">
                    Appointment history will appear here after visits are
                    completed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Appointments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {appointments.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">C</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Visits
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {completedAppointments.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Upcoming Visits
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {upcomingAppointments.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientHistory;

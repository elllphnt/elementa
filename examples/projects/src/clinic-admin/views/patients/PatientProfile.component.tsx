import React from "react";
import Layout from "../../components/Layout.component.js";
import useAppointments from "../../hooks/useAppointments.hook.js";
import usePatients from "../../hooks/usePatients.hook.js";

interface PatientProfileProps {
  patientId: string;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patientId }) => {
  const { getPatientById, loading: patientLoading } = usePatients();
  const { getAppointmentsByPatientId, loading: appointmentsLoading } =
    useAppointments();

  const patient = getPatientById(patientId);
  const appointments = getAppointmentsByPatientId(patientId);

  const upcomingAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      return aptDate >= today && apt.status !== "cancelled";
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter((apt) => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      return aptDate < today || apt.status === "completed";
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (patientLoading || appointmentsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout title="Patient Not Found">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            Patient with ID {patientId} not found.
          </div>
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

  return (
    <Layout title={`${patient.firstName} ${patient.lastName}`}>
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
                    <span>{patient.email}</span>
                    <span>•</span>
                    <span>{patient.phone}</span>
                    <span>•</span>
                    <span>
                      DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <a
                  href={`/patients/${patient.id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Patient
                </a>
                <a
                  href={`/patients/${patient.id}/history`}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  View History
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Patient Information
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Full name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.firstName} {patient.lastName}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Email address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.email}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Phone number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.phone}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Date of birth
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.address}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Emergency Contact
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.emergencyContact.name || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.emergencyContact.phone || "Not provided"}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Relationship
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {patient.emergencyContact.relationship || "Not provided"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Medical History
                </h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                {patient.medicalHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalHistory.map((condition, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No medical history recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Appointments Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upcoming Appointments
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="px-4 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.type.charAt(0).toUpperCase() +
                              appointment.type.slice(1)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {appointment.notes}
                          </div>
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
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No upcoming appointments
                  </div>
                )}
              </div>
              <div className="px-4 py-3 bg-gray-50 text-center">
                <a
                  href={`/appointments/new?patientId=${patient.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Schedule New Appointment
                </a>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Appointments
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {pastAppointments.length > 0 ? (
                  pastAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="px-4 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.type.charAt(0).toUpperCase() +
                              appointment.type.slice(1)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </div>
                          {appointment.diagnosis && (
                            <div className="text-xs text-blue-600 mt-1">
                              Diagnosis: {appointment.diagnosis}
                            </div>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No past appointments
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile;

import React from "react";
import Layout from "../components/Layout.component.js";
import useAppointments from "../hooks/useAppointments.hook.js";
import usePatients from "../hooks/usePatients.hook.js";

const Dashboard: React.FC = () => {
  const { getUpcomingAppointments, loading: appointmentsLoading } =
    useAppointments();
  const { patients, loading: patientsLoading } = usePatients();

  const upcomingAppointments = getUpcomingAppointments();
  const recentPatients = patients.slice(0, 5);

  if (appointmentsLoading || patientsLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Patients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {patients.length}
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
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Appointments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {upcomingAppointments.length}
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
                  <span className="text-white text-sm font-medium">T</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Today's Appointments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {
                      upcomingAppointments.filter((apt) => {
                        const today = new Date();
                        const aptDate = new Date(apt.date);
                        return aptDate.toDateString() === today.toDateString();
                      }).length
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Upcoming Appointments
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Next scheduled appointments
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {upcomingAppointments.slice(0, 5).map((appointment) => {
              const patient = patients.find(
                (p) => p.id === appointment.patientId
              );
              return (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient
                              ? `${patient.firstName} ${patient.lastName}`
                              : "Unknown Patient"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
                  </div>
                </li>
              );
            })}
          </ul>
          {upcomingAppointments.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-500">
              No upcoming appointments
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Patients
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Recently registered patients
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentPatients.map((patient) => (
              <li key={patient.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.email}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

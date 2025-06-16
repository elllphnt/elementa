import React, { useState } from "react";
import Layout from "../../components/Layout.component.js";
import useAppointments from "../../hooks/useAppointments.hook.js";
import useDoctors from "../../hooks/useDoctors.hook.js";
import usePatients from "../../hooks/usePatients.hook.js";

const AppointmentList: React.FC = () => {
  const { appointments, updateAppointmentStatus, loading, error } =
    useAppointments();
  const { patients } = usePatients();
  const { doctors } = useDoctors();
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "today" | "completed"
  >("all");

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : "Unknown Patient";
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
  };

  const filterAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case "today":
        return appointments.filter((apt) => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        });
      case "upcoming":
        return appointments.filter((apt) => {
          const aptDate = new Date(apt.date);
          return (
            aptDate >= today &&
            apt.status !== "cancelled" &&
            apt.status !== "completed"
          );
        });
      case "completed":
        return appointments.filter((apt) => apt.status === "completed");
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments().sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: "confirmed" | "completed" | "cancelled"
  ) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <Layout title="Appointments">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Appointments">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Appointments">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            All Appointments
          </h2>
          <p className="text-gray-600">
            Manage patient appointments and schedules
          </p>
        </div>
        <a
          href="/appointments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Schedule New Appointment
        </a>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: "all", label: "All Appointments" },
              { key: "today", label: "Today" },
              { key: "upcoming", label: "Upcoming" },
              { key: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAppointments.map((appointment) => (
            <li key={appointment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {appointment.type[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getPatientName(appointment.patientId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        with {getDoctorName(appointment.doctorId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.date} at {appointment.time} •{" "}
                        {appointment.duration} min
                      </div>
                      {appointment.notes && (
                        <div className="text-xs text-gray-400 mt-1">
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {appointment.type}
                      </div>
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
                    <div className="flex space-x-2">
                      {appointment.status === "scheduled" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "confirmed")
                          }
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      {(appointment.status === "scheduled" ||
                        appointment.status === "confirmed") && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "completed")
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Complete
                        </button>
                      )}
                      {appointment.status !== "cancelled" &&
                        appointment.status !== "completed" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(appointment.id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      <a
                        href={`/appointments/${appointment.id}`}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
                {appointment.symptoms.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Symptoms:</div>
                    <div className="flex flex-wrap gap-1">
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
            </li>
          ))}
        </ul>
        {filteredAppointments.length === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="text-gray-500 text-lg">No appointments found</div>
            <p className="text-gray-400 mt-2">
              {filter === "all"
                ? "Get started by scheduling your first appointment."
                : `No appointments match the ${filter} filter.`}
            </p>
            {filter === "all" && (
              <a
                href="/appointments/new"
                className="mt-4 inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Schedule New Appointment
              </a>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentList;

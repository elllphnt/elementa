import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.tsx";
import { Input, Select } from "../../components/ui/Form.tsx";
import { useAppointments } from "../../hooks/useAppointments.ts";
import { useDoctors } from "../../hooks/useDoctors.ts";
import styles from "../../styles/AppointmentList.module.css";

export function AppointmentList() {
  const { appointments, loading, error, fetchAppointments, updateAppointment } =
    useAppointments();
  const { doctors, fetchDoctors } = useDoctors();
  const [filters, setFilters] = useState({
    status: "",
    doctor: "",
    date: "",
  });

  useEffect(() => {
    fetchAppointments(1, 20, filters);
    fetchDoctors();
  }, [filters, fetchAppointments, fetchDoctors]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update appointment status:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      "scheduled": "#3b82f6",
      "confirmed": "#22c55e",
      "in-progress": "#f59e0b",
      "completed": "#8b5cf6",
      "cancelled": "#ef4444",
    };
    return statusColors[status as keyof typeof statusColors] || "#6b7280";
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "scheduled", label: "Scheduled" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const doctorOptions = [
    { value: "", label: "All Doctors" },
    ...doctors.map((doctor) => ({
      value: doctor.id,
      label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    })),
  ];

  if (loading) {
    return (
      <div className={styles.appointmentList}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          Loading appointments...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.appointmentList}>
        <div className={styles.loadingState}>
          <p>Error loading appointments: {error}</p>
          <Button onClick={() => fetchAppointments(1, 20, filters)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appointmentList}>
      <div className={styles.header}>
        <h1 className={styles.title}>Appointments</h1>
        <div className={styles.actions}>
          <Link to="/appointments/new">
            <Button variant="primary">Schedule New Appointment</Button>
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date</label>
          <Input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Status</label>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            options={statusOptions}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Doctor</label>
          <Select
            value={filters.doctor}
            onChange={(e) => handleFilterChange("doctor", e.target.value)}
            options={doctorOptions}
          />
        </div>
      </div>

      <div className={styles.appointmentContainer}>
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.appointmentHeader}>
                <div>
                  <div className={styles.appointmentTime}>
                    {formatTime(appointment.time)}
                  </div>
                  <div className={styles.appointmentDate}>
                    {formatDate(appointment.date)}
                  </div>
                </div>
                <div className={styles.appointmentActions}>
                  <Link to={`/appointments/${appointment.id}`}>
                    <Button variant="outline" size="small">
                      View
                    </Button>
                  </Link>
                  <Select
                    value={appointment.status}
                    onChange={(e) =>
                      handleStatusChange(appointment.id, e.target.value)
                    }
                    options={statusOptions.slice(1)} // Remove "All Statuses" option
                  />
                </div>
              </div>

              <div className={styles.appointmentDetails}>
                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>Patient</div>
                  <div className={styles.detailValue}>
                    {appointment.patient
                      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                      : "Unknown Patient"}
                  </div>
                </div>

                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>Doctor</div>
                  <div className={styles.detailValue}>
                    {appointment.doctor
                      ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                      : "Unknown Doctor"}
                  </div>
                </div>

                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>Type</div>
                  <div className={styles.detailValue}>
                    {appointment.type.charAt(0).toUpperCase() +
                      appointment.type.slice(1)}
                  </div>
                </div>

                <div className={styles.detailGroup}>
                  <div className={styles.detailLabel}>Duration</div>
                  <div className={styles.detailValue}>
                    {appointment.duration} minutes
                  </div>
                </div>
              </div>

              <div
                className={styles.statusChip}
                style={{
                  backgroundColor: getStatusColor(appointment.status) + "20",
                  color: getStatusColor(appointment.status),
                }}
              >
                {appointment.status.charAt(0).toUpperCase() +
                  appointment.status.slice(1).replace("-", " ")}
              </div>

              {appointment.reason && (
                <div className={styles.appointmentNotes}>
                  <div className={styles.notesLabel}>Reason</div>
                  <div className={styles.notesText}>{appointment.reason}</div>
                </div>
              )}

              {appointment.notes && (
                <div className={styles.appointmentNotes}>
                  <div className={styles.notesLabel}>Notes</div>
                  <div className={styles.notesText}>{appointment.notes}</div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.loadingState}>
            <div>
              <h3>No Appointments Found</h3>
              <p>No appointments match the current filters.</p>
              <Link to="/appointments/new">
                <Button variant="primary">Schedule First Appointment</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

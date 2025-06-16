import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments.ts";
import { useDoctors } from "../hooks/useDoctors.ts";
import { usePatients } from "../hooks/usePatients.ts";
import styles from "../styles/Dashboard.module.css";

export function Dashboard() {
  const { patients } = usePatients();
  const { appointments } = useAppointments();
  const { doctors } = useDoctors();
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    // Filter today's appointments
    const today = new Date().toISOString().split("T")[0];
    const todayAppts = appointments
      .filter((apt) => apt.date === today)
      .slice(0, 5); // Show only first 5
    setTodayAppointments(todayAppts);
  }, [appointments]);

  const stats = [
    {
      label: "Total Patients",
      value: patients.length,
      color: "var(--primary-color)",
    },
    {
      label: "Today's Appointments",
      value: todayAppointments.length,
      color: "var(--success-color)",
    },
    {
      label: "Active Doctors",
      value: doctors.length,
      color: "var(--warning-color)",
    },
    {
      label: "This Month",
      value: appointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        const now = new Date();
        return (
          aptDate.getMonth() === now.getMonth() &&
          aptDate.getFullYear() === now.getFullYear()
        );
      }).length,
      color: "var(--secondary-color)",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Welcome back! Here's what's happening at your clinic today.
        </p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statsCard}>
            <div className={styles.statsNumber} style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className={styles.statsLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Today's Appointments</h2>
              <Link to="/appointments" className={styles.actionButton}>
                View All
              </Link>
            </div>
            <div className={styles.sectionContent}>
              {todayAppointments.length > 0 ? (
                <div className={styles.appointmentList}>
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={styles.appointmentItem}
                    >
                      <div className={styles.appointmentTime}>
                        {appointment.time}
                      </div>
                      <div className={styles.appointmentDetails}>
                        {appointment.patient?.firstName}{" "}
                        {appointment.patient?.lastName}
                      </div>
                      <div className={styles.appointmentDoctor}>
                        Dr. {appointment.doctor?.firstName}{" "}
                        {appointment.doctor?.lastName}
                      </div>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[
                            `status${
                              appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1).replace("-", "")
                            }`
                          ]
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                  No appointments scheduled for today
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.quickActions}>
                <Link to="/patients/new" className={styles.actionButton}>
                  Add New Patient
                </Link>
                <Link to="/appointments/new" className={styles.actionButton}>
                  Schedule Appointment
                </Link>
                <Link to="/patients" className={styles.actionButton}>
                  View All Patients
                </Link>
                <Link to="/doctors" className={styles.actionButton}>
                  Manage Doctors
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
            </div>
            <div className={styles.sectionContent}>
              <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                No recent activity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

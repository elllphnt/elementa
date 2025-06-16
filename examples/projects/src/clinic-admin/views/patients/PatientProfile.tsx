import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button.tsx";
import { useAppointments } from "../../hooks/useAppointments.ts";
import { usePatients } from "../../hooks/usePatients.ts";
import styles from "../../styles/PatientProfile.module.css";
import { Patient } from "../../types/index.js";
import { calculateAge, formatDate } from "../../utils/dateUtils.ts";

export function PatientProfile() {
  const { patientId } = useParams<{ patientId: string }>();
  const { patients, loading } = usePatients();
  const { appointments } = useAppointments();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (patientId && patients.length > 0) {
      const foundPatient = patients.find((p) => p.id === patientId);
      setPatient(foundPatient || null);
    }
  }, [patientId, patients]);

  useEffect(() => {
    // In a real app, you'd fetch patient-specific appointments
    // For now, we'll filter from all appointments
  }, [appointments]);

  if (loading) {
    return (
      <div className={styles.patientProfile}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          Loading patient...
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.patientProfile}>
        <div className={styles.loadingState}>
          <div>
            <h3>Patient Not Found</h3>
            <p>The requested patient could not be found.</p>
            <Link to="/patients">
              <Button variant="primary">Back to Patients</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const patientAppointments = appointments.filter(
    (apt) => apt.patientId === patient.id
  );
  const recentAppointments = patientAppointments.slice(0, 5);
  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className={styles.patientProfile}>
      <Link to="/patients" className={styles.backButton}>
        ← Back to Patients
      </Link>

      <div className={styles.header}>
        <div className={styles.patientInfo}>
          <h1 className={styles.patientName}>
            {patient.firstName} {patient.lastName}
          </h1>
          <div className={styles.patientMeta}>
            <div className={styles.metaItem}>
              <span>📧</span>
              <span>{patient.email}</span>
            </div>
            <div className={styles.metaItem}>
              <span>📱</span>
              <span>{patient.phone}</span>
            </div>
            <div className={styles.metaItem}>
              <span>🎂</span>
              <span>{age} years old</span>
            </div>
            <div className={styles.metaItem}>
              <span>📅</span>
              <span>Patient since {formatDate(patient.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <Link to={`/patients/${patient.id}/edit`}>
            <Button variant="outline">Edit Patient</Button>
          </Link>
          <Link to={`/appointments/new?patient=${patient.id}`}>
            <Button variant="primary">Schedule Appointment</Button>
          </Link>
        </div>
      </div>

      <div className={styles.profileGrid}>
        <div className={styles.mainContent}>
          {/* Personal Information */}
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Full Name</div>
                  <div className={styles.infoValue}>
                    {patient.firstName} {patient.lastName}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Date of Birth</div>
                  <div className={styles.infoValue}>
                    {formatDate(patient.dateOfBirth)} ({age} years old)
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Email</div>
                  <div className={styles.infoValue}>{patient.email}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Phone</div>
                  <div className={styles.infoValue}>{patient.phone}</div>
                </div>
              </div>

              {patient.address && (
                <div
                  className={styles.infoItem}
                  style={{ marginTop: "var(--spacing-lg)" }}
                >
                  <div className={styles.infoLabel}>Address</div>
                  <div className={styles.infoValue}>{patient.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Medical Information</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Medical History</div>
                  <div className={styles.tagList}>
                    {patient.medicalHistory.length > 0 ? (
                      patient.medicalHistory.map((item, index) => (
                        <span key={index} className={styles.tag}>
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className={styles.infoValue}>
                        No medical history recorded
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Allergies</div>
                  <div className={styles.tagList}>
                    {patient.allergies.length > 0 ? (
                      patient.allergies.map((item, index) => (
                        <span key={index} className={styles.tag}>
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className={styles.infoValue}>
                        No known allergies
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Emergency Contact</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.emergencyContact}>
                <div className={styles.emergencyTitle}>
                  {patient.emergencyContact.name}
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Phone</div>
                    <div className={styles.infoValue}>
                      {patient.emergencyContact.phone}
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoLabel}>Relationship</div>
                    <div className={styles.infoValue}>
                      {patient.emergencyContact.relationship}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          {/* Quick Stats */}
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Quick Stats</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.quickStats}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {patientAppointments.length}
                  </div>
                  <div className={styles.statLabel}>Total Visits</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {
                      patientAppointments.filter(
                        (apt) => apt.status === "completed"
                      ).length
                    }
                  </div>
                  <div className={styles.statLabel}>Completed</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {
                      patientAppointments.filter(
                        (apt) =>
                          apt.status === "scheduled" ||
                          apt.status === "confirmed"
                      ).length
                    }
                  </div>
                  <div className={styles.statLabel}>Upcoming</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {patient.medicalHistory.length + patient.allergies.length}
                  </div>
                  <div className={styles.statLabel}>Medical Notes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Appointments</h2>
              <Link to="/appointments">
                <Button variant="ghost" size="small">
                  View All
                </Button>
              </Link>
            </div>
            <div className={styles.sectionContent}>
              {recentAppointments.length > 0 ? (
                <div className={styles.appointmentsList}>
                  {recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={styles.appointmentItem}
                    >
                      <div className={styles.appointmentDate}>
                        {formatDate(appointment.date)} at {appointment.time}
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
                  No appointments found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useDoctors } from "../../hooks/useDoctors.ts";
import styles from "../../styles/DoctorList.module.css";

export function DoctorList() {
  const { doctors, loading, error, fetchDoctors } = useDoctors();

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatAvailability = (availability: any[]) => {
    return availability.map((slot) => ({
      ...slot,
      day: slot.day.charAt(0).toUpperCase() + slot.day.slice(1),
    }));
  };

  if (loading) {
    return (
      <div className={styles.doctorList}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          Loading doctors...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.doctorList}>
        <div className={styles.emptyState}>
          <h3>Error Loading Doctors</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.doctorList}>
      <div className={styles.header}>
        <h1 className={styles.title}>Doctors</h1>
      </div>

      {doctors.length > 0 ? (
        <div className={styles.doctorGrid}>
          {doctors.map((doctor) => (
            <div key={doctor.id} className={styles.doctorCard}>
              <div className={styles.doctorHeader}>
                <div className={styles.doctorAvatar}>
                  {getInitials(doctor.firstName, doctor.lastName)}
                </div>
                <div className={styles.doctorInfo}>
                  <h3 className={styles.doctorName}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className={styles.doctorSpecialization}>
                    {doctor.specialization}
                  </p>
                </div>
              </div>

              <div className={styles.doctorDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Department</span>
                  <span className={styles.detailValue}>
                    {doctor.department}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Experience</span>
                  <span className={styles.detailValue}>
                    {doctor.experience} years
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>License</span>
                  <span className={styles.detailValue}>
                    {doctor.licenseNumber}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{doctor.email}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Phone</span>
                  <span className={styles.detailValue}>{doctor.phone}</span>
                </div>

                {doctor.availability && doctor.availability.length > 0 && (
                  <div className={styles.availabilityList}>
                    <div className={styles.availabilityTitle}>Availability</div>
                    {formatAvailability(doctor.availability)
                      .slice(0, 3)
                      .map((slot, index) => (
                        <div key={index} className={styles.availabilityItem}>
                          <span>{slot.day}</span>
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      ))}
                    {doctor.availability.length > 3 && (
                      <div className={styles.availabilityItem}>
                        <span>+{doctor.availability.length - 3} more days</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No Doctors Found</h3>
          <p>No doctors are currently registered in the system.</p>
        </div>
      )}
    </div>
  );
}

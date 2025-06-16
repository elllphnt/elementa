import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.tsx";
import { Input } from "../../components/ui/Form.tsx";
import { usePatients } from "../../hooks/usePatients.ts";
import styles from "../../styles/PatientList.module.css";
import tableStyles from "../../styles/Table.module.css";

export function PatientList() {
  const { patients, loading, error, pagination, fetchPatients, deletePatient } =
    usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPatients(currentPage, 10, searchTerm);
  }, [currentPage, searchTerm, fetchPatients]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDelete = async (patientId: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(patientId);
      } catch (error) {
        console.error("Failed to delete patient:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.patientList}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          Loading patients...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.patientList}>
        <div className={styles.emptyState}>
          <h3>Error Loading Patients</h3>
          <p>{error}</p>
          <Button onClick={() => fetchPatients(currentPage, 10, searchTerm)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.patientList}>
      <div className={styles.header}>
        <h1 className={styles.title}>Patients</h1>
        <div className={styles.actions}>
          <div className={styles.searchContainer}>
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearch}
              search
            />
          </div>
          <Link to="/patients/new">
            <Button variant="primary">Add New Patient</Button>
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {patients.length > 0 ? (
          <>
            <table className={tableStyles.table}>
              <thead className={tableStyles.tableHeader}>
                <tr className={tableStyles.tableRow}>
                  <th className={tableStyles.tableHeaderCell}>Name</th>
                  <th className={tableStyles.tableHeaderCell}>Email</th>
                  <th className={tableStyles.tableHeaderCell}>Phone</th>
                  <th className={tableStyles.tableHeaderCell}>Date of Birth</th>
                  <th className={tableStyles.tableHeaderCell}>Last Visit</th>
                  <th className={tableStyles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className={tableStyles.tableRow}>
                    <td className={tableStyles.tableCell}>
                      <Link to={`/patients/${patient.id}`}>
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </td>
                    <td className={tableStyles.tableCell}>{patient.email}</td>
                    <td className={tableStyles.tableCell}>{patient.phone}</td>
                    <td className={tableStyles.tableCell}>
                      {formatDate(patient.dateOfBirth)}
                    </td>
                    <td className={tableStyles.tableCell}>
                      {formatDate(patient.updatedAt)}
                    </td>
                    <td className={tableStyles.tableCell}>
                      <div className={tableStyles.tableActions}>
                        <Link to={`/patients/${patient.id}`}>
                          <button
                            className={`${tableStyles.actionButton} ${tableStyles.viewButton}`}
                            title="View Patient"
                          >
                            👁️
                          </button>
                        </Link>
                        <Link to={`/patients/${patient.id}/edit`}>
                          <button
                            className={`${tableStyles.actionButton} ${tableStyles.editButton}`}
                            title="Edit Patient"
                          >
                            ✏️
                          </button>
                        </Link>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                          onClick={() => handleDelete(patient.id)}
                          title="Delete Patient"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, pagination.total)} of{" "}
                {pagination.total} patients
              </div>
              <div className={styles.paginationControls}>
                <button
                  className={styles.pageButton}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 2
                  )
                  .map((page) => (
                    <button
                      key={page}
                      className={`${styles.pageButton} ${
                        page === currentPage ? styles.active : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  className={styles.pageButton}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>No Patients Found</h3>
            <p>
              {searchTerm
                ? `No patients match "${searchTerm}"`
                : "Start by adding your first patient"}
            </p>
            <Link to="/patients/new">
              <Button variant="primary">Add New Patient</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

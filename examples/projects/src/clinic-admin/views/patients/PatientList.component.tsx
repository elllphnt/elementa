import React from "react";
import Layout from "../../components/Layout.component.js";
import usePatients from "../../hooks/usePatients.hook.js";

const PatientList: React.FC = () => {
  const { patients, loading, error } = usePatients();

  if (loading) {
    return (
      <Layout title="Patients">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Patients">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Patients">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Patients</h2>
          <p className="text-gray-600">
            Manage patient records and information
          </p>
        </div>
        <a
          href="/patients/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New Patient
        </a>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <li key={patient.id}>
              <a
                href={`/patients/${patient.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.email} • {patient.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        DOB:{" "}
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Registered:{" "}
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {patient.medicalHistory.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalHistory
                          .slice(0, 3)
                          .map((condition, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                            >
                              {condition}
                            </span>
                          ))}
                        {patient.medicalHistory.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{patient.medicalHistory.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
        {patients.length === 0 && (
          <div className="px-4 py-12 text-center">
            <div className="text-gray-500 text-lg">No patients found</div>
            <p className="text-gray-400 mt-2">
              Get started by adding your first patient.
            </p>
            <a
              href="/patients/new"
              className="mt-4 inline-flex bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add New Patient
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientList;

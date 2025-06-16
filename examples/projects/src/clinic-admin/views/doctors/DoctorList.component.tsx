import React from "react";
import Layout from "../../components/Layout.component.js";
import useDoctors from "../../hooks/useDoctors.hook.js";

const DoctorList: React.FC = () => {
  const { doctors, loading, error } = useDoctors();

  if (loading) {
    return (
      <Layout title="Doctors">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Doctors">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Doctors">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Medical Staff</h2>
        <p className="text-gray-600">Our team of healthcare professionals</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {doctor.firstName[0]}
                      {doctor.lastName[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {doctor.firstName} {doctor.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {doctor.specialization}
                  </p>
                  <p className="text-sm text-gray-500">{doctor.department}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{doctor.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">License:</span>
                    <span className="ml-2">{doctor.licenseNumber}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <a
                  href={`/appointments/new?doctorId=${doctor.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-3 py-2 rounded-md text-sm font-medium"
                >
                  Schedule Appointment
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No doctors found</div>
          <p className="text-gray-400 mt-2">
            Doctor information will appear here.
          </p>
        </div>
      )}

      {/* Department Summary */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Departments</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from(new Set(doctors.map((d) => d.department))).map(
            (department) => {
              const departmentDoctors = doctors.filter(
                (d) => d.department === department
              );
              const specializations = Array.from(
                new Set(departmentDoctors.map((d) => d.specialization))
              );

              return (
                <div key={department} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{department}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {departmentDoctors.length} doctor
                    {departmentDoctors.length !== 1 ? "s" : ""}
                  </p>
                  <div className="mt-2">
                    {specializations.map((spec, index) => (
                      <span
                        key={spec}
                        className="inline-block text-xs text-gray-500"
                      >
                        {spec}
                        {index < specializations.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorList;

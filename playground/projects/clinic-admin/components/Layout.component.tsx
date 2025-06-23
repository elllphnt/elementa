import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Clinic Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </a>
              <a href="/patients" className="text-gray-600 hover:text-gray-900">
                Patients
              </a>
              <a
                href="/appointments"
                className="text-gray-600 hover:text-gray-900"
              >
                Appointments
              </a>
              <a href="/doctors" className="text-gray-600 hover:text-gray-900">
                Doctors
              </a>
              <a href="/settings" className="text-gray-600 hover:text-gray-900">
                Settings
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {title && (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              {title}
            </h2>
          </div>
        )}
        <div className="px-4 sm:px-0">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

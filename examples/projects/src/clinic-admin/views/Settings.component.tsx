import React, { useState } from "react";
import Layout from "../components/Layout.component.js";

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    clinicName: "City Medical Center",
    clinicAddress: "123 Healthcare Drive, Medical City, MC 12345",
    clinicPhone: "+1-555-0100",
    clinicEmail: "info@citymedical.com",
    businessHours: {
      monday: { start: "08:00", end: "18:00", closed: false },
      tuesday: { start: "08:00", end: "18:00", closed: false },
      wednesday: { start: "08:00", end: "18:00", closed: false },
      thursday: { start: "08:00", end: "18:00", closed: false },
      friday: { start: "08:00", end: "18:00", closed: false },
      saturday: { start: "09:00", end: "15:00", closed: false },
      sunday: { start: "09:00", end: "15:00", closed: true },
    },
    appointmentDuration: 30,
    autoConfirmAppointments: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBusinessHoursChange = (
    day: string,
    field: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to an API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto">
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-green-800">Settings saved successfully!</div>
          </div>
        )}

        <div className="space-y-6">
          {/* Clinic Information */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Clinic Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="clinicName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    id="clinicName"
                    value={settings.clinicName}
                    onChange={(e) =>
                      handleSettingChange("clinicName", e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clinicPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="clinicPhone"
                    value={settings.clinicPhone}
                    onChange={(e) =>
                      handleSettingChange("clinicPhone", e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="clinicEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="clinicEmail"
                    value={settings.clinicEmail}
                    onChange={(e) =>
                      handleSettingChange("clinicEmail", e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="clinicAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <textarea
                    id="clinicAddress"
                    rows={2}
                    value={settings.clinicAddress}
                    onChange={(e) =>
                      handleSettingChange("clinicAddress", e.target.value)
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Business Hours
              </h3>
              <div className="space-y-4">
                {days.map((day) => {
                  const daySettings =
                    settings.businessHours[
                      day.key as keyof typeof settings.businessHours
                    ];
                  return (
                    <div key={day.key} className="flex items-center space-x-4">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-700">
                          {day.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!daySettings.closed}
                          onChange={(e) =>
                            handleBusinessHoursChange(
                              day.key,
                              "closed",
                              !e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </div>
                      {!daySettings.closed && (
                        <>
                          <input
                            type="time"
                            value={daySettings.start}
                            onChange={(e) =>
                              handleBusinessHoursChange(
                                day.key,
                                "start",
                                e.target.value
                              )
                            }
                            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={daySettings.end}
                            onChange={(e) =>
                              handleBusinessHoursChange(
                                day.key,
                                "end",
                                e.target.value
                              )
                            }
                            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </>
                      )}
                      {daySettings.closed && (
                        <span className="text-sm text-gray-500">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appointment Settings */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Appointment Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="appointmentDuration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Default Appointment Duration (minutes)
                  </label>
                  <select
                    id="appointmentDuration"
                    value={settings.appointmentDuration}
                    onChange={(e) =>
                      handleSettingChange(
                        "appointmentDuration",
                        parseInt(e.target.value)
                      )
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoConfirm"
                    checked={settings.autoConfirmAppointments}
                    onChange={(e) =>
                      handleSettingChange(
                        "autoConfirmAppointments",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="autoConfirm"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Automatically confirm new appointments
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={(e) =>
                      handleSettingChange(
                        "emailNotifications",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="emailNotifications"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Send email notifications to patients
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onChange={(e) =>
                      handleSettingChange("smsNotifications", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="smsNotifications"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Send SMS notifications to patients
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

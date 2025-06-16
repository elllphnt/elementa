import React, { useState } from "react";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Form.js";
import { useAuth } from "../hooks/useAuth.js";
import styles from "../styles/Settings.module.css";

export function Settings() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    systemUpdates: true,
    darkMode: false,
  });

  const [message, setMessage] = useState("");

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSettingToggle = (setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      profileData.newPassword &&
      profileData.newPassword !== profileData.confirmPassword
    ) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      // Here you would typically call an API to update the profile
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>
          Manage your account settings and preferences
        </p>
      </div>

      <div className={styles.settingsContainer}>
        <div className={styles.settingsGrid}>
          {/* Profile Settings */}
          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Profile Information</h2>
              <p className={styles.sectionDescription}>
                Update your personal information and change your password
              </p>
            </div>
            <div className={styles.sectionContent}>
              {message && (
                <div
                  className={
                    message.includes("successfully")
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {message}
                </div>
              )}

              <form
                onSubmit={handleProfileSubmit}
                className={styles.profileForm}
              >
                <Input
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  required
                />

                <Input
                  type="email"
                  label="Email Address"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                />

                <div className={styles.formSection}>
                  <h3
                    style={{
                      margin: "0 0 1rem",
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    Change Password
                  </h3>

                  <div style={{ display: "grid", gap: "1rem" }}>
                    <Input
                      type="password"
                      label="Current Password"
                      name="currentPassword"
                      value={profileData.currentPassword}
                      onChange={handleProfileChange}
                    />

                    <Input
                      type="password"
                      label="New Password"
                      name="newPassword"
                      value={profileData.newPassword}
                      onChange={handleProfileChange}
                    />

                    <Input
                      type="password"
                      label="Confirm New Password"
                      name="confirmPassword"
                      value={profileData.confirmPassword}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Notification Settings */}
          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Notifications</h2>
              <p className={styles.sectionDescription}>
                Configure how you want to receive notifications
              </p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>Email Notifications</div>
                  <div className={styles.settingDescription}>
                    Receive email notifications for important updates
                  </div>
                </div>
                <div className={styles.settingControl}>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={settings.emailNotifications}
                      onChange={() => handleSettingToggle("emailNotifications")}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>SMS Notifications</div>
                  <div className={styles.settingDescription}>
                    Receive text message notifications for urgent matters
                  </div>
                </div>
                <div className={styles.settingControl}>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={settings.smsNotifications}
                      onChange={() => handleSettingToggle("smsNotifications")}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>
                    Appointment Reminders
                  </div>
                  <div className={styles.settingDescription}>
                    Send reminders to patients about upcoming appointments
                  </div>
                </div>
                <div className={styles.settingControl}>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={settings.appointmentReminders}
                      onChange={() =>
                        handleSettingToggle("appointmentReminders")
                      }
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>System Preferences</h2>
              <p className={styles.sectionDescription}>
                Customize your system experience
              </p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>System Updates</div>
                  <div className={styles.settingDescription}>
                    Receive notifications about system updates and maintenance
                  </div>
                </div>
                <div className={styles.settingControl}>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={settings.systemUpdates}
                      onChange={() => handleSettingToggle("systemUpdates")}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingLabel}>Dark Mode</div>
                  <div className={styles.settingDescription}>
                    Enable dark mode for reduced eye strain
                  </div>
                </div>
                <div className={styles.settingControl}>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={settings.darkMode}
                      onChange={() => handleSettingToggle("darkMode")}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Account Actions</h2>
              <p className={styles.sectionDescription}>
                Manage your account and session
              </p>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.actionButtons}>
                <Button variant="error" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

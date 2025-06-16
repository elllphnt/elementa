import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button.tsx";
import { Input } from "../../components/ui/Form.tsx";
import { useAuth } from "../../hooks/useAuth.ts";
import styles from "../../styles/Login.module.css";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      await login(formData.email, formData.password);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError("Invalid email or password");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>🏥</div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>
            Sign in to your clinic admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {(error || localError) && (
            <div className={styles.errorMessage}>{error || localError}</div>
          )}

          <div className={styles.formGroup}>
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className={styles.forgotPassword}>
          <a href="#" className={styles.forgotPasswordLink}>
            Forgot your password?
          </a>
        </div>

        <div className={styles.footer}>
          <p>© 2025 Clinic Admin System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

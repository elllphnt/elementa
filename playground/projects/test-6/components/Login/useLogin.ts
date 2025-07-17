import { useState } from "react";
// import { useLogin as useLoginContext } from "./LoginProvider.js";

export default function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // const { login, error, isAuthenticated } = useLoginContext();
  const { login, error, isAuthenticated } = {
    login: async (email: string, password: string) => {
      // Placeholder for actual authentication logic
      alert(`Logging in with ${email} and ${password}`);
    },
    error: null,
    isAuthenticated: false,
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  return {
    email,
    password,
    showPassword,
    error,
    isAuthenticated,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    togglePasswordVisibility,
    resetForm,
  };
}

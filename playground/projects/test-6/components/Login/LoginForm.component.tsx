import useLogin from "./useLogin.js";

export default function LoginForm() {
  const {
    email,
    password,
    showPassword,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    togglePasswordVisibility,
  } = useLogin();

  return (
    <form
      onSubmit={handleSubmit}
      css={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "400px",
        padding: "24px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <label
          htmlFor="email"
          css={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
          required
          css={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "border-color 0.3s ease",
            // "&:focus": {
            //   outline: "none",
            //   borderColor: "#4A90E2",
            // },
          }}
        />
      </div>

      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          position: "relative",
        }}
      >
        <label
          htmlFor="password"
          css={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter your password"
          required
          css={{
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "16px",
            transition: "border-color 0.3s ease",
            // "&:focus": {
            //   outline: "none",
            //   borderColor: "#4A90E2",
            // },
          }}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          css={{
            position: "absolute",
            right: "10px",
            top: "38px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#888",
            fontSize: "14px",
          }}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {error && (
        <div
          css={{
            backgroundColor: "#FFEBEE",
            color: "#D32F2F",
            padding: "12px",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        css={{
          padding: "14px",
          backgroundColor: "#4A90E2",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          // "&:hover": {
          //   backgroundColor: "#357ABD",
          // },
        }}
      >
        Log In
      </button>

      <div
        css={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
          color: "#666",
        }}
      >
        <link
          href="/forgot-password"
          css={{
            color: "#4A90E2",
            textDecoration: "none",
            // "&:hover": {
            //   textDecoration: "underline",
            // },
          }}
        >
          Forgot Password?
        </link>
        <link
          href="/signup"
          css={{
            color: "#4A90E2",
            textDecoration: "none",
            // "&:hover": {
            //   textDecoration: "underline",
            // },
          }}
        >
          Sign Up
        </link>
      </div>
    </form>
  );
}

export const css = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const stage = {
  showInViewport: true,
  variants: [
    {
      name: "default",
      props: {},
    },
    {
      name: "withError",
      props: {},
    },
  ],
};

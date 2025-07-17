import React, { useState } from "react";

export default function Component() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    // Here you would normally handle your login logic
    setTimeout(() => {
      setLoading(false);
      alert("Login submitted");
    }, 1000);
  };

  return (
    <div
      css={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        css={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 8px 20px rgba(118, 75, 162, 0.3)",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          animation: "fadeIn 0.7s ease forwards",
        }}
        aria-label="Login form"
      >
        <h1
          css={{
            margin: 0,
            fontSize: "2rem",
            color: "#4b3f72",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          SaaS Company Login
        </h1>

        <label htmlFor="email" css={{ fontWeight: "600", color: "#333" }}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          css={{
            padding: "10px",
            fontSize: "1rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease",
            "&:focus": {
              borderColor: "#764ba2",
              outline: "none",
              boxShadow: "0 0 5px #764ba2",
            },
          }}
          autoComplete="username"
        />

        <label htmlFor="password" css={{ fontWeight: "600", color: "#333" }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          css={{
            padding: "10px",
            fontSize: "1rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            transition: "border-color 0.3s ease",
            "&:focus": {
              borderColor: "#764ba2",
              outline: "none",
              boxShadow: "0 0 5px #764ba2",
            },
          }}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          css={{
            padding: "12px",
            fontSize: "1.1rem",
            backgroundColor: "#764ba2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s ease",
            "&:hover:not(:disabled)": {
              backgroundColor: "#58367a",
            },
            "&:focus": {
              outline: "3px solid #b799d9",
              outlineOffset: "2px",
            },
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <style>
        {`@keyframes fadeIn { from {opacity: 0; transform: translateY(10px);} to {opacity: 1; transform: translateY(0);} }`}
      </style>
    </div>
  );
}

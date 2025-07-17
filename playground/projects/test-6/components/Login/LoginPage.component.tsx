import LoginForm from "./LoginForm.component.js";
// import { LoginProvider } from "./LoginProvider.js";

export default function LoginPage() {
  return (
    // <LoginProvider>
    <div
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "20px",
      }}
    >
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h1
          css={{
            marginBottom: "32px",
            fontSize: "32px",
            fontWeight: "700",
            color: "#333",
            textAlign: "center",
          }}
        >
          Welcome Back
        </h1>
        <LoginForm />

        <div
          css={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div
            css={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              marginBottom: "16px",
            }}
          >
            <div
              css={{
                flex: 1,
                height: "1px",
                backgroundColor: "#ddd",
              }}
            />
            <span
              css={{
                margin: "0 16px",
                color: "#888",
                fontSize: "14px",
              }}
            >
              Or continue with
            </span>
            <div
              css={{
                flex: 1,
                height: "1px",
                backgroundColor: "#ddd",
              }}
            />
          </div>

          <div
            css={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              width: "100%",
            }}
          >
            <button
              css={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                // "&:hover": {
                //   transform: "scale(1.1)",
                // },
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C2.785 21.1 7.18 24 12.255 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.525 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98A11.921 11.921 0 0 0 .255 12c0 1.93.47 3.76 1.29 5.38l3.98-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-5.075 0-9.47 2.91-11.58 7.14l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
            </button>

            <button
              css={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                // "&:hover": {
                //   transform: "scale(1.1)",
                // },
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </button>

            <button
              css={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                backgroundColor: "white",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                // "&:hover": {
                //   transform: "scale(1.1)",
                // },
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#000"
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    // {/* </LoginProvider> */}
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
  ],
};

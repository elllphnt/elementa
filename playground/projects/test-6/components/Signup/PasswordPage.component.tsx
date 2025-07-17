export default function PassowordUp() {
  return (
    <div
      css={{
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        color: "#333",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0,0, 0.1)",
        maxWidth: "400px",
        margin: "50px auto",
        animation: "fadeIn 0.5s ease-in-out",
      }}
    >
      This is the Password Page.
      <link to="/login">Go to Login Page</link>
    </div>
  );
}

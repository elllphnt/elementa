export default function Home() {
  return (
    <div
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <div
        css={{
          width: "300px",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          color: "#333",
        }}
      >
        <h1 css={{ margin: 0, marginBottom: "10px" }}>
          Welcome to the Home Page
        </h1>
        <p>This is a simple stateless card component with no props.</p>
      </div>
    </div>
  );
}

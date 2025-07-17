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
          "width": "320px",
          "padding": "20px",
          "borderRadius": "8px",
          "boxShadow": "0 4px 8px rgba(0, 0, 0, 0.1)",
          "backgroundColor": "#fff",
          "textAlign": "center",
          "fontFamily": "Arial, sans-serif",
          "color": "#333",
          "transition": "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
        <h1 css={{ margin: 0, marginBottom: "15px" }}>Submit Your Info</h1>
        <button
          type="submit"
          css={{
            "padding": "10px 20px",
            "borderRadius": "4px",
            "border": "none",
            "backgroundColor": "#007BFF",
            "color": "#fff",
            "fontSize": "16px",
            "fontWeight": "bold",
            "cursor": "pointer",
            "transition": "background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#0056b3",
            },
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

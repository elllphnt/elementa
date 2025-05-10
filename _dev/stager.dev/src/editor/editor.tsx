import { Board } from "./board";
import { SideBar } from "./sidebar";

export function Editor() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          width: "300px",
          backgroundColor: "#f0f0f0",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <SideBar />
      </div>
      <div style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
        <Board />
      </div>
    </div>
  );
}

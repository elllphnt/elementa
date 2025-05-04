import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div>
      <h1>Editor</h1>
      <p>This is the editor app.</p>
    </div>
  </StrictMode>
);

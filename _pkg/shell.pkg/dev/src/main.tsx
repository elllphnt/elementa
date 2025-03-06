import "@repo/styles/dist/elll.css";
import { createRoot } from "react-dom/client";
import { ShellView } from "../../src";
import shell from "./shell";

const root = createRoot(document.getElementById("root")!);

function App() {
  return (
    <div className="fixed el-inset-0">
      <ShellView shell={shell} />
    </div>
  );
}

async function main() {
  root.render(<App />);
}

main();

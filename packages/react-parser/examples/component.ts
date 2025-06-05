import { writeFileSync } from "fs";
import { join } from "path";
import { parseComponentModule } from "../src/index.js";

const componentModule = `

import React from "react";

interface DashboardProps {
  color?: string;
  blue: string;
}

export function Dashboard({color}:DashboardProps) {
  const state = useState(true);
  
  return (
  <elll-for data={state} as="name">
    <div className="dashboard" style={{ color }}>
      <span className="dashboard" style={{ color }}>
        Hello, {"name".trim()} a dashboard component!
      </span>
      </div>
      <span className="dashboard" style={{ color }}>
        Hello, {"name".trim()} a dashboard component!
      </span>
  </elll-for>
  );
}

export default Dashboard;
`;

const module = parseComponentModule({
  code: componentModule,
  getStylesheet: () => {},
});
writeFileSync(
  join("local", "component", `static.json`),
  JSON.stringify(module, null, 2)
);

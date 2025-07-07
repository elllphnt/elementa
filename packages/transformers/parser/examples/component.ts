import { parseComponentModule } from "../src/index.js";

const componentModule = `
import React from "react";
import {useUser} from "hooks";

interface DashboardProps {
  color?: string;
  blue: string;
}

export function Dashboard({color}:DashboardProps) {
   function ok() {
    return data.map((item: any, index: number) => {
      return (
        <React.Fragment key={index}>
          {React.createElement("span", {}, item[as])}
        </React.Fragment>
      );
    });
  }

  const state = useUser({id: "1234"});
  
  return (
  <elll-for data={state} as="name">
    <div className="dashboard" style={{ color }}>
      <span className="dashboard" style={{ color }}>
        Hello, {"name".trim()} a dashboard component!
      </span>
      </div>
      {ok()}
      <span className="dashboard" style={{ color }}>
        Hello, {"name".trim()} a dashboard component!
      </span>
  </elll-for>
  );
}

export default Dashboard;
`;

const data = parseComponentModule({
  sourceCode: componentModule,
  getStylesheet: () => ({}),
});

console.log(JSON.stringify(data, null, 2));

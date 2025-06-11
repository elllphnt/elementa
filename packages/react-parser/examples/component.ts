import { parseComponentModule } from "../src/index.js";

const componentModule = `

import React from "react";

interface DashboardProps {
  color?: string;
  blue: string;
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  let state = initialValue;
  const setState = (value: T) => {
    state = value;
  };
  return [state, setState];
}

const elllFor = (props: { data: any; as: string }) => {
  const { data, as } = props;
  return data.map((item: any, index: number) => (
    <div key={index} data-elll-for={as}>
      {item}
    </div>
  ));
};

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

parseComponentModule({
  sourceCode: componentModule,
  // getStylesheet: () => {},
});

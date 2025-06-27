import { compileComponentToElll } from "./src/compile/component.js";

// Example TSX module with embedded styles
const tsxWithStyles = `
import React from 'react';

export const styles = \`
  #myComponent {
    background-color: blue;
    color: white;
    padding: 16px;
  }
  
  #myComponent:hover {
    background-color: darkblue;
  }
\`;

interface Props {
  title: string;
}

export default function MyComponent({ title }: Props) {
  return (
    <div id="myComponent">
      <h1>{title}</h1>
      <p>This is a component with embedded styles.</p>
    </div>
  );
}
`;

// Test the new functionality
try {
  const componentData = compileComponentToElll({ tsx: tsxWithStyles });
  console.log(
    "Successfully compiled component with embedded styles:",
    componentData
  );
} catch (error) {
  console.error("Error compiling component:", error);
}

// Test backward compatibility - with separate CSS
const tsxWithoutStyles = `
import React from 'react';

interface Props {
  title: string;
}

export default function MyComponent({ title }: Props) {
  return (
    <div id="myComponent">
      <h1>{title}</h1>
      <p>This is a component with separate styles.</p>
    </div>
  );
}
`;

const separateCss = `
#myComponent {
  background-color: red;
  color: white;
  padding: 16px;
}
`;

try {
  const componentData = compileComponentToElll({
    tsx: tsxWithoutStyles,
    css: separateCss,
  });
  console.log(
    "Successfully compiled component with separate CSS:",
    componentData
  );
} catch (error) {
  console.error("Error compiling component with separate CSS:", error);
}

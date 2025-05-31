import { parseComponentModule } from "../src/component_module";

const componentModule = `
export function Component1() {
  const state1 = useState("Initial Value");
  useState(10);

  return (
    <div>
      <h1>Component 1</h1>
      <p>This is the first component.</p>
      <button onClick={() => alert('Button in Component 1 clicked!')}>
        Click Me
      </button>
    </div>
  );
}
`;

const module = parseComponentModule(componentModule);
console.log(JSON.stringify(module, null, 2));

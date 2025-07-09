import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { Project, SyntaxKind } from "ts-morph";
import { describe, expect, it } from "vitest";
import { denormalizeComponentFunction } from "../src/parsers/component/denormalize.js";
import { normalizeComponentFunction } from "../src/parsers/component/normalize.js";

describe("Component Denormalize -> Normalize -> Denormalize Round Trip", () => {
  const createProject = () => {
    return new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 99, // ESNext
        module: 99, // ESNext
        jsx: 2, // React JSX
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      },
    });
  };

  // Helper function to write transformation logs
  const writeTransformationLog = (
    testName: string,
    stage: string,
    code: string,
    ext: string = "ts"
  ) => {
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const logDir = join(process.cwd(), "logs", "tests", sanitizedTestName);

    try {
      mkdirSync(logDir, { recursive: true });
      const fileName = `${stage}.${ext}`;
      const filePath = join(logDir, fileName);
      writeFileSync(filePath, code, "utf8");
    } catch (error) {
      console.warn(`Failed to write log for ${testName}/${stage}:`, error);
    }
  };

  // Helper function to normalize code for comparison by removing extra whitespace
  const normalizeCodeForComparison = (code: string): string => {
    return code
      .replace(/\s+/g, " ") // Replace multiple whitespace with single space
      .replace(/\s*{\s*/g, "{") // Remove whitespace around opening braces
      .replace(/\s*}\s*/g, "}") // Remove whitespace around closing braces
      .replace(/\s*;\s*/g, ";") // Remove whitespace around semicolons
      .replace(/\s*,\s*/g, ",") // Remove whitespace around commas
      .replace(/\s*\(\s*/g, "(") // Remove whitespace around opening parentheses
      .replace(/\s*\)\s*/g, ")") // Remove whitespace around closing parentheses
      .replace(/\s*<\s*/g, "<") // Remove whitespace around opening angle brackets
      .replace(/\s*>\s*/g, ">") // Remove whitespace around closing angle brackets
      .trim();
  };

  const testRoundTripFromDenormalized = (
    testName: string,
    componentCode: string,
    expectedToMatch: boolean = true
  ) => {
    it(testName, () => {
      const project = createProject();
      const sourceFile = project.createSourceFile("test.tsx", componentCode);

      // Find the component function
      let componentFunction: any = null;

      // Check for function declarations
      const functions = sourceFile.getFunctions();
      if (functions.length > 0) {
        componentFunction = functions[0];
      } else {
        // Check for variable declarations with arrow functions or function expressions
        const variableDeclarations = sourceFile.getVariableDeclarations();
        for (const decl of variableDeclarations) {
          const init = decl.getInitializer();
          if (
            init &&
            (init.getKind() === SyntaxKind.ArrowFunction ||
              init.getKind() === SyntaxKind.FunctionExpression)
          ) {
            componentFunction = init;
            break;
          }
        }

        if (!componentFunction) {
          console.log(
            "Available functions:",
            functions.map((f) => f.getText())
          );
          console.log(
            "Available variable declarations:",
            variableDeclarations.map((d: any) => d.getText())
          );
          throw new Error("No component function found in test code");
        }
      }

      // Log the original code
      const originalCode = componentFunction.getText();
      writeTransformationLog(testName, "01_original", originalCode);

      // Step 1: First normalize to get the "canonical" transformed version
      normalizeComponentFunction(componentFunction);

      // Log the normalized code
      const firstNormalizedCode = componentFunction.getText();
      writeTransformationLog(testName, "02_normalized", firstNormalizedCode);

      // Step 2: Then denormalize to get the "canonical" denormalized form
      denormalizeComponentFunction(componentFunction);

      // Log the denormalized code
      const canonicalDenormalizedCode = componentFunction.getText();
      writeTransformationLog(
        testName,
        "03_denormalized",
        canonicalDenormalizedCode
      );

      // Step 3: Now test the round trip: normalize again
      normalizeComponentFunction(componentFunction);

      const normalizedCode = componentFunction.getText();
      // Log the re-normalized code
      writeTransformationLog(testName, "04_renormalized", normalizedCode);

      // Step 4: And denormalize again
      denormalizeComponentFunction(componentFunction);

      const finalDenormalizedCode = componentFunction.getText();
      // Log the final denormalized code
      writeTransformationLog(
        testName,
        "05_final_denormalized",
        finalDenormalizedCode
      );

      // Create a comprehensive summary log
      const summaryLog = `
# Transformation Log for: ${testName}

## 01. Original Code
\`\`\`typescript
${originalCode}
\`\`\`

## 02. After First Normalize
\`\`\`typescript
${firstNormalizedCode}
\`\`\`

## 03. After First Denormalize (Canonical)
\`\`\`typescript
${canonicalDenormalizedCode}
\`\`\`

## 04. After Re-normalize 
\`\`\`typescript
${normalizedCode}
\`\`\`

## 05. After Final Denormalize
\`\`\`typescript
${finalDenormalizedCode}
\`\`\`

## Analysis
- **Round-trip successful**: ${
        normalizeCodeForComparison(canonicalDenormalizedCode) ===
        normalizeCodeForComparison(finalDenormalizedCode)
      }
- **Canonical normalized**: ${normalizeCodeForComparison(
        canonicalDenormalizedCode
      )}
- **Final normalized**: ${normalizeCodeForComparison(finalDenormalizedCode)}
`;
      writeTransformationLog(testName, "00_summary", summaryLog, "md");

      // Step 5: Verify round trip identity: final should match canonical
      if (expectedToMatch) {
        // Compare normalized versions to ignore formatting differences
        const normalizedCanonical = normalizeCodeForComparison(
          canonicalDenormalizedCode
        );
        const normalizedFinal = normalizeCodeForComparison(
          finalDenormalizedCode
        );

        if (normalizedCanonical !== normalizedFinal) {
          console.log("Canonical denormalized:", canonicalDenormalizedCode);
          console.log("Final denormalized:", finalDenormalizedCode);
          console.log("Normalized canonical:", normalizedCanonical);
          console.log("Normalized final:", normalizedFinal);
        }

        expect(normalizedFinal).toBe(normalizedCanonical);
      } else {
        // For debugging purposes, show the difference
        console.log("Canonical denormalized:", canonicalDenormalizedCode);
        console.log("After normalize:", normalizedCode);
        console.log("Final denormalized:", finalDenormalizedCode);
      }
    });
  };

  // Test Cases - testing denormalize -> normalize -> denormalize round trip
  testRoundTripFromDenormalized(
    "JSX return",
    `
    function SimpleComponent(props) {
      return <div>Hello World</div>;
    }
    `
  );

  testRoundTripFromDenormalized(
    "arrow function",
    `
    const ArrowComponent = (props) => {
      return <div>Arrow function component</div>;
    }
    `
  );

  testRoundTripFromDenormalized(
    "props access",
    `
    function PropsComponent(props) {
      return <div>Hello {props.name}</div>;
    }
    `
  );

  testRoundTripFromDenormalized(
    "nested JSX",
    `
    function NestedComponent(props) {
      return <div><span>Nested</span></div>;
    }
    `
  );

  testRoundTripFromDenormalized(
    "props destructuring",
    `
    function DestructuredComponent({ name, age }) {
      return <div>Hello {name}, you are {age} years old</div>;
    }
    `
  );

  testRoundTripFromDenormalized(
    "hooks",
    `
    function HookComponent(props) {
      const [count, setCount] = useState(0);
      const value = useMemo(() => count * 2, [count]);
      
      return <div>Count: {count}, Value: {value}</div>;
    }
    `
  );

  testRoundTripFromDenormalized(
    "legacy ref",
    `
    function RefComponent(props, ref) {
      return <div ref={ref}>Component with ref</div>;
    }
    `
  );

  testRoundTripFromDenormalized(
    "expression-body arrow functions",
    `
    const ExpressionArrowComponent = (props) => <div>Expression body</div>;
    `
  );

  testRoundTripFromDenormalized(
    "fragments",
    `
    function FragmentComponent(props) {
      return (
        <>
          <h1>Title</h1>
          <div>Content</div>
        </>
      );
    }
    `
  );

  testRoundTripFromDenormalized(
    "nested fragments",
    `
    function NestedFragmentComponent(props) {
      return (
        <>
          <h1>Main Title</h1>
          <div>
            {
              <>
                <h2>Nested Fragment</h2>
                <p>This is in a nested fragment</p>
              </>
            }
          </div>
          <footer>
            <>Footer content</>
          </footer>
        </>
      );
    }
    `
  );
});

import { ComponentData } from "@elllphnt/elementa-base";
import { Project } from "ts-morph";
import {
  getStylesheetFromCssModule,
  parseComponentModule,
  parseCssModule,
} from "../parsers/_.js";

// Function to extract CSS styles from a TSX module
function extractStylesFromTsxModule(tsx: string): string {
  try {
    // Create a temporary TypeScript project to parse the module
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        jsx: 4, // Preserve JSX
        allowJs: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      },
    });

    // Create a source file from the TSX content
    const sourceFile = project.createSourceFile("temp.tsx", tsx);

    // Look for a variable declaration named 'styles' that's also exported
    const variableStatements = sourceFile.getVariableStatements();
    for (const statement of variableStatements) {
      const declarations = statement.getDeclarationList().getDeclarations();
      for (const declaration of declarations) {
        if (declaration.getName() === "styles") {
          const initializer = declaration.getInitializer();
          if (initializer) {
            const text = initializer.getText();
            // Check if it's a template literal
            if (text.startsWith("`") && text.endsWith("`")) {
              return text.slice(1, -1); // Remove backticks
            }
            // Check if it's a string literal
            if (
              (text.startsWith('"') && text.endsWith('"')) ||
              (text.startsWith("'") && text.endsWith("'"))
            ) {
              return text.slice(1, -1); // Remove quotes
            }
          }
        }
      }
    }

    // Alternative: Look for inline export const styles = `...`
    const moduleDeclarations = sourceFile.getVariableStatements().filter(
      (stmt) =>
        stmt.hasExportKeyword() ||
        stmt
          .getDeclarationList()
          .getDeclarations()
          .some((decl) => decl.getName() === "styles")
    );

    for (const statement of moduleDeclarations) {
      if (statement.hasExportKeyword()) {
        const declarations = statement.getDeclarationList().getDeclarations();
        for (const declaration of declarations) {
          if (declaration.getName() === "styles") {
            const initializer = declaration.getInitializer();
            if (initializer) {
              const text = initializer.getText();
              // Check if it's a template literal
              if (text.startsWith("`") && text.endsWith("`")) {
                return text.slice(1, -1); // Remove backticks
              }
              // Check if it's a string literal
              if (
                (text.startsWith('"') && text.endsWith('"')) ||
                (text.startsWith("'") && text.endsWith("'"))
              ) {
                return text.slice(1, -1); // Remove quotes
              }
            }
          }
        }
      }
    }

    return ""; // No styles found
  } catch (error) {
    console.warn("Failed to extract styles from TSX module:", error);
    return ""; // Return empty string on error
  }
}

/**
 * Compiles a React component TSX module to the Elll format.
 *
 * This function now supports two ways of providing CSS styles:
 * 1. Via a separate CSS string parameter (backward compatibility)
 * 2. Via a named export called 'styles' from the TSX module (new approach)
 *
 * If both are provided, the separate CSS parameter takes precedence.
 * If neither is provided, the component will be compiled without styles.
 *
 * @param tsx - The TSX component module source code
 * @param css - Optional separate CSS string (takes precedence over embedded styles)
 * @returns ComponentData in Elll format
 *
 * @example
 * // New approach - styles embedded in TSX module:
 * const tsxWithStyles = `
 *   export const styles = \`
 *     #myComponent { color: blue; }
 *   \`;
 *   export default function MyComponent() {
 *     return <div id="myComponent">Hello</div>;
 *   }
 * \`;
 * const componentData = compileComponentToElll({ tsx: tsxWithStyles });
 *
 * @example
 * // Legacy approach - separate CSS:
 * const tsx = `export default function MyComponent() { return <div id="myComponent">Hello</div>; }`;
 * const css = `#myComponent { color: blue; }`;
 * const componentData = compileComponentToElll({ tsx, css });
 */
export function compileComponentToElll({
  tsx,
  css = "",
}: {
  tsx: string;
  css?: string;
}): ComponentData {
  // If no separate CSS is provided, try to extract it from the TSX module
  const cssToUse = css || extractStylesFromTsxModule(tsx);

  const parsedCssModule = parseCssModule(cssToUse);
  const componentData = parseComponentModule({
    sourceCode: tsx,
    getStylesheet: (id) => {
      return getStylesheetFromCssModule({
        id,
        module: parsedCssModule,
        classes: [],
        conditionals: {},
        getModifierDefinition: () => undefined,
      });
    },
  });
  return componentData;
}

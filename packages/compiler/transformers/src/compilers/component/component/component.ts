import type { ComponentData } from "@elllphnt/elementa-base";
import { Project, type SourceFile } from "ts-morph";

export function compileComponent(data: ComponentData): string {
  const project = new Project();

  const sourceFile = project.createSourceFile("component.tsx", "", {
    overwrite: true,
  });

  createModuleWithMorph(sourceFile, data);

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
  });

  return sourceFile.getFullText();
}

function createModuleWithMorph(
  sourceFile: SourceFile,
  data: ComponentData
): void {
  const componentName = data.name || "Component";

  generateComponentFunction({ name: componentName, sourceFile, data });

  sourceFile.addExportAssignment({
    isExportEquals: false,
    expression: componentName,
  });
}

function generateComponentFunction({
  name,
  data,
  sourceFile,
}: {
  name: string;
  sourceFile: SourceFile;
  data: ComponentData;
}): void {
  const propsName = `${name}Props`;
  sourceFile.addInterface({
    isExported: true,
    name: propsName,
    properties: [
      {
        name: "__fills",
        type: "Record<string, any>",
        hasQuestionToken: true,
      },
      ...(data.props ?? []).map((prop) => ({
        name: prop.name || "prop",
        type: mapDataInputToTSType(prop),
        hasQuestionToken: !prop.required,
      })),
    ],
  });

  // Add the function
  sourceFile.addFunction({
    name,
    parameters: [
      {
        name: "props",
        type: propsName,
      },
    ],
    statements: generateComponentFunctionBody(data),
  });
}

function mapDataInputToTSType(input: any): string {
  // Map data input types to TypeScript types
  switch (input.type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "any[]";
    case "object":
      return "Record<string, any>";
    default:
      return "any";
  }
}

function generateComponentFunctionBody(data: ComponentData): string[] {
  const statements: string[] = [];

  // Create fills constant
  statements.push("const fills = props.__fills || {};");

  // Create fragments object if fragments exist
  if (data.fragments && data.fragments.length > 0) {
    statements.push("const fragments = {");
    data.fragments.forEach((fragment) => {
      statements.push(`  "${fragment.id || "fragment"}": () => <></>,`);
    });
    statements.push("};");
  }

  // Add state declarations
  if (data.states) {
    for (const state of data.states) {
      const stateName = state.name || "state";
      const setterName = `set${stateName
        .charAt(0)
        .toUpperCase()}${stateName.slice(1)}`;
      const initialValue =
        (state as any).init !== undefined
          ? JSON.stringify((state as any).init)
          : "null";

      statements.push(
        `const [${stateName}, ${setterName}] = useState(${initialValue});`
      );
    }
  }

  // Create return statement with JSX
  statements.push(createJSXReturnStatement(data));

  return statements;
}

function createJSXReturnStatement(data: ComponentData): string {
  // If no content, return empty fragment
  if (!data.content || data.content.length === 0) {
    return "return <></>;";
  }

  // If single element, return it directly or wrap in fragment
  if (data.content.length === 1) {
    const jsx = createJSXFromElementMorph(data.content[0]);
    return `return ${jsx};`;
  }

  // Multiple elements, wrap in fragment
  const children = data.content.map(createJSXFromElementMorph).join("\n    ");
  return `return (\n    <>\n      ${children}\n    </>\n  );`;
}

function createJSXFromElementMorph(element: any): string {
  if (typeof element === "string") {
    return `"${element.replace(/"/g, '\\"')}"`;
  }

  // Handle different element types
  switch (element.type) {
    case "container":
      return createContainerElementMorph(element);
    case "text":
      return createTextElementMorph(element);
    case "component":
      return createComponentElementMorph(element);
    case "slot":
      return createSlotElementMorph(element);
    case "primitive":
      return createPrimitiveElementMorph(element);
    case "media":
      return createMediaElementMorph(element);
    case "vector":
      return createVectorElementMorph(element);
    case "fragment":
      return createFragmentElementMorph(element);
    case "expression":
      return createExpressionElementMorph(element);
    default:
      return "<div />";
  }
}

function createContainerElementMorph(data: any): string {
  const tag = data.tag || "div";
  const attributes = createElementAttributesMorph(data);
  const children = data.content?.map(createJSXFromElementMorph) || [];

  if (children.length === 0) {
    return `<${tag}${attributes} />`;
  }

  const childrenStr = children.join("\n        ");
  return `<${tag}${attributes}>\n        ${childrenStr}\n      </${tag}>`;
}

function createTextElementMorph(data: any): string {
  const tag = data.tag || "span";
  const attributes = createElementAttributesMorph(data);

  let textContent = "";
  if (typeof data.text === "string") {
    // Handle {{expression}} interpolation
    const expressionRegex = /\{\{([^}]*\}?[^}]*)\}\}/g;
    if (expressionRegex.test(data.text)) {
      textContent = data.text.replace(expressionRegex, "{$1}");
    } else {
      textContent = data.text;
    }
  } else {
    textContent = `{${data.text || "''"}}`;
  }

  return `<${tag}${attributes}>${textContent}</${tag}>`;
}

function createComponentElementMorph(data: any): string {
  if (!data.componentUrl) {
    return "<div>/* Missing component URL */</div>";
  }

  const componentName =
    data.componentUrl
      .split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "") || "Component";
  const capitalizedName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);

  const attributes = createElementAttributesMorph(data);

  // Add component props
  let propsStr = "";
  if (data.props) {
    const propEntries = Object.entries(data.props).map(
      ([key, value]) => `${key}={${JSON.stringify(value)}}`
    );
    propsStr = propEntries.length > 0 ? " " + propEntries.join(" ") : "";
  }

  // Add __fills prop for slot fills
  if (data.fills) {
    const fillsEntries = Object.entries(data.fills).map(
      ([key]: [string, any]) =>
        `"${key}": { content: <>{/* fill content */}</> }`
    );
    propsStr += ` __fills={{${fillsEntries.join(", ")}}}`;
  }

  const children = data.content?.map(createJSXFromElementMorph) || [];

  if (children.length === 0) {
    return `<${capitalizedName}${attributes}${propsStr} />`;
  }

  const childrenStr = children.join("\n        ");
  return `<${capitalizedName}${attributes}${propsStr}>\n        ${childrenStr}\n      </${capitalizedName}>`;
}

function createSlotElementMorph(data: any): string {
  const slotId = data.id;

  if (data.mode === "outlet") {
    return "<Outlet />";
  }

  return `{fills["${slotId}"]?.content ?? null}`;
}

function createPrimitiveElementMorph(data: any): string {
  if (!data.primitiveUrl) {
    return "<div>/* Missing primitive URL */</div>";
  }

  const primitiveName =
    data.primitiveUrl
      .split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "") || "Primitive";
  const capitalizedName =
    primitiveName.charAt(0).toUpperCase() + primitiveName.slice(1);

  const attributes = createElementAttributesMorph(data);

  let propsStr = "";
  if (data.props) {
    const propEntries = Object.entries(data.props).map(
      ([key, value]) => `${key}={${JSON.stringify(value)}}`
    );
    propsStr = propEntries.length > 0 ? " " + propEntries.join(" ") : "";
  }

  const children = data.content?.map(createJSXFromElementMorph) || [];

  if (children.length === 0) {
    return `<${capitalizedName}${attributes}${propsStr} />`;
  }

  const childrenStr = children.join("\n        ");
  return `<${capitalizedName}${attributes}${propsStr}>\n        ${childrenStr}\n      </${capitalizedName}>`;
}

function createMediaElementMorph(data: any): string {
  if (!data.media) {
    return "<div>/* Missing media content */</div>";
  }

  const tag = data.media.type === "video" ? "video" : "img";
  const attributes = createElementAttributesMorph(data);

  let mediaPropsStr = "";
  if (data.media.src) {
    mediaPropsStr += ` src="${data.media.src}"`;
  }

  if (data.media.type === "image" && data.media.alt) {
    mediaPropsStr += ` alt="${data.media.alt}"`;
  }

  if (data.media.type === "video") {
    const videoProps = ["poster", "autoplay", "loop", "muted", "controls"];
    for (const prop of videoProps) {
      if (data.media[prop] !== undefined) {
        const propName = prop === "autoplay" ? "autoPlay" : prop;
        mediaPropsStr += ` ${propName}={${data.media[prop]}}`;
      }
    }
  }

  return `<${tag}${attributes}${mediaPropsStr} />`;
}

function createVectorElementMorph(data: any): string {
  const attributes = createElementAttributesMorph(data);

  let svgPropsStr = "";
  const svgProps = ["width", "height", "viewBox", "preserveAspectRatio"];
  for (const prop of svgProps) {
    if (data[prop] !== undefined) {
      svgPropsStr += ` ${prop}="${data[prop]}"`;
    }
  }

  const children =
    data.content?.map((node: any) => createVectorNodeMorph(node)) || [];

  if (children.length === 0) {
    return `<svg${attributes}${svgPropsStr} />`;
  }

  const childrenStr = children.join("\n        ");
  return `<svg${attributes}${svgPropsStr}>\n        ${childrenStr}\n      </svg>`;
}

function createVectorNodeMorph(node: any): string {
  if (node.type === "text") {
    return String(node.value);
  }

  const tag = node.tagName;
  let propsStr = "";

  if (node.properties) {
    const propEntries = Object.entries(node.properties).map(
      ([key, value]) => `${key}="${value}"`
    );
    propsStr = propEntries.length > 0 ? " " + propEntries.join(" ") : "";
  }

  const children = node.children?.map(createVectorNodeMorph) || [];

  if (children.length === 0) {
    return `<${tag}${propsStr} />`;
  }

  const childrenStr = children.join("");
  return `<${tag}${propsStr}>${childrenStr}</${tag}>`;
}

function createFragmentElementMorph(data: any): string {
  const fragmentId = data.fragmentId;
  if (!fragmentId) {
    return "<></>";
  }

  const params = data.params
    ? Object.entries(data.params)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(", ")
    : "";

  return `{fragments["${fragmentId}"]({${params}})}`;
}

function createExpressionElementMorph(data: any): string {
  const expression = data.expression;
  if (!expression) {
    return "<></>";
  }

  return `{${expression}}`;
}

function createElementAttributesMorph(data: any): string {
  const attributes: string[] = [];

  // Add base element attributes
  if (data.ariaLabel) {
    attributes.push(`aria-label="${data.ariaLabel}"`);
  }

  if (data.ariaHidden !== undefined) {
    attributes.push(`aria-hidden={${data.ariaHidden}}`);
  }

  if (data.ariaRole) {
    attributes.push(`role="${data.ariaRole}"`);
  }

  if (data.tabIndex !== undefined) {
    attributes.push(`tabIndex={${data.tabIndex}}`);
  }

  // Add interaction handlers
  if (data.interactions) {
    const reactEventMap: Record<string, string> = {
      click: "onClick",
      mouseenter: "onMouseEnter",
      mouseleave: "onMouseLeave",
      focus: "onFocus",
      blur: "onBlur",
      change: "onChange",
      input: "onInput",
      submit: "onSubmit",
    };

    for (const [event, expression] of Object.entries(data.interactions)) {
      const reactEvent = reactEventMap[event] || event;
      attributes.push(`${reactEvent}={${expression}}`);
    }
  }

  // Add className if stylesheet exists
  if (data.stylesheet) {
    attributes.push('className="generated-class"');
  }

  // Handle links
  if (data.link) {
    if (data.link.type === "href" && data.link.href) {
      attributes.push(`href="${data.link.href}"`);
    }
  }

  return attributes.length > 0 ? " " + attributes.join(" ") : "";
}

function addCssExport(sourceFile: SourceFile, data: ComponentData): void {
  // Generate CSS string
  let cssContent = "";

  if ((data as any).stylesheet) {
    cssContent += generateCssFromStylesheet((data as any).stylesheet);
  }

  // Add CSS from nested elements
  cssContent += generateCssFromContent(data.content || []);

  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: "const" as any,
    declarations: [
      {
        name: "css",
        initializer: `\`${cssContent}\``,
      },
    ],
  });
}

function generateCssFromStylesheet(stylesheet: any): string {
  // This is a simplified CSS generation
  if (typeof stylesheet === "string") {
    return stylesheet;
  }

  if (typeof stylesheet === "object") {
    // Convert object-style CSS to string
    let css = "";
    for (const [selector, rules] of Object.entries(stylesheet)) {
      css += `${selector} {\n`;
      if (typeof rules === "object") {
        for (const [property, value] of Object.entries(rules as any)) {
          css += `  ${property}: ${value};\n`;
        }
      }
      css += "}\n";
    }
    return css;
  }

  return "";
}

function generateCssFromContent(content: any[]): string {
  let css = "";
  content.forEach((item) => {
    if (typeof item === "string") return;
    if (item.stylesheet) {
      css += generateCssFromStylesheet(item.stylesheet);
    }
    if (item.content) {
      css += generateCssFromContent(item.content);
    }
  });
  return css;
}

function hasStylesheets(data: ComponentData): boolean {
  // Check if any element in the component has stylesheets
  if ((data as any).stylesheet) return true;

  // Recursively check content for stylesheets
  function checkContent(content: any[]): boolean {
    if (!content) return false;
    return content.some((item) => {
      if (typeof item === "string") return false;
      if (item.stylesheet) return true;
      if (item.content) return checkContent(item.content);
      return false;
    });
  }

  return checkContent(data.content || []);
}

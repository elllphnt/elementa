import type {
  ComponentData,
  ElementData,
  StateData,
} from "@elllphnt/elementa-base";
import {
  printTypeNode,
  tsTypeToTypeNode,
} from "@elllphnt/elementa-transformer-primitives";
import { Project, VariableDeclarationKind } from "ts-morph";

export function compileState(state: StateData): string {
  const varName = state.varName || state.name || `state${state.id}`;

  switch (state.type) {
    case "value": {
      const initValue = state.init ? compileInitValue(state.init) : "undefined";
      const typeAnnotation = state.tsType ? `<${state.tsType}>` : "";
      return `const [${varName}, set${capitalize(
        varName
      )}] = useState${typeAnnotation}(${initValue});`;
    }

    case "hook": {
      const hookName = state.hookUrl || "useCustomHook";
      const args = compileHookArgs(state.args || {}, state.argMode || "named");
      return `const ${varName} = ${hookName}(${args});`;
    }

    case "inline": {
      const script = state.script || "";
      return script;
    }

    default:
      return `// Unknown state type: ${(state as any).type}`;
  }
}

function compileInitValue(init: any): string {
  if (typeof init === "object" && init !== null) {
    if (init.kind === "evaluable") {
      return init.expression || "undefined";
    }
    if (init.kind === "resolvable") {
      return init.value !== undefined
        ? JSON.stringify(init.value)
        : "undefined";
    }
  }
  return JSON.stringify(init);
}

function compileHookArgs(
  args: Record<string, any>,
  argMode: "positional" | "named"
): string {
  const entries = Object.entries(args);

  if (entries.length === 0) {
    return "";
  }

  if (argMode === "positional") {
    return entries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => compileArgValue(value))
      .join(", ");
  }

  // named mode
  const namedArgs = entries
    .map(([key, value]) => `${key}: ${compileArgValue(value)}`)
    .join(", ");

  return `{ ${namedArgs} }`;
}

function compileArgValue(value: any): string {
  if (typeof value === "object" && value !== null) {
    if (value.kind === "evaluable") {
      return value.expression || "undefined";
    }
    if (value.kind === "resolvable") {
      return value.value !== undefined
        ? JSON.stringify(value.value)
        : "undefined";
    }
  }
  return JSON.stringify(value);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function compileElement(element: ElementData): string {
  // Handle conditional rendering
  const conditionWrapper = element.condition
    ? (content: string) =>
        `{${compileEvaluable(element.condition)} && (${content})}`
    : (content: string) => content;

  // Handle repeat/loop
  const repeatWrapper = element.repeat
    ? (content: string) => compileRepeat(element.repeat!, content)
    : (content: string) => content;

  const baseProps = compileBaseElementProps(element);
  let elementContent: string;

  switch (element.type) {
    case "container": {
      const children =
        element.content?.map((child) => compileElement(child)).join("") || "";
      elementContent = `<div${baseProps}>${children}</div>`;
      break;
    }

    case "text": {
      const textContent = element.text
        ? compileResolvableOrEvaluable(element.text)
        : '""';
      const marks = element.marks?.length
        ? compileTextMarks(element.marks, textContent)
        : textContent;
      elementContent = `<span${baseProps}>{${marks}}</span>`;
      break;
    }

    case "component": {
      const componentName = element.componentUrl || "UnknownComponent";
      const props = element.props
        ? Object.entries(element.props)
            .map(
              ([key, value]) =>
                `${key}={${compileResolvableOrEvaluable(value)}}`
            )
            .join(" ")
        : "";
      const fills = element.fills
        ? Object.entries(element.fills)
            .map(([key, fill]) => `${key}={${compileSlotFill(fill)}}`)
            .join(" ")
        : "";
      const allProps = [baseProps, props, fills].filter(Boolean).join(" ");
      elementContent = `<${componentName}${allProps ? " " + allProps : ""}/>`;
      break;
    }

    case "primitive": {
      const primitiveComponent = element.primitiveUrl || "div";
      const props = element.props
        ? Object.entries(element.props)
            .map(
              ([key, value]) =>
                `${key}={${compileResolvableOrEvaluable(value)}}`
            )
            .join(" ")
        : "";
      const children =
        element.content?.map((child) => compileElement(child)).join("") || "";
      const allProps = [baseProps, props].filter(Boolean).join(" ");
      elementContent = `<${primitiveComponent}${
        allProps ? " " + allProps : ""
      }>${children}</${primitiveComponent}>`;
      break;
    }

    case "slot": {
      const placeholder =
        element.placeholder?.map((child) => compileElement(child)).join("") ||
        "";
      elementContent = `<Slot${baseProps}>${placeholder}</Slot>`;
      break;
    }

    case "media": {
      const mediaElement = compileMediaElement(element);
      elementContent = `<div${baseProps}>${mediaElement}</div>`;
      break;
    }

    case "vector": {
      const vectorProps = compileVectorProps(element);
      const vectorContent =
        element.content?.map((node) => compileVectorNode(node)).join("") || "";
      elementContent = `<svg${baseProps}${vectorProps}>${vectorContent}</svg>`;
      break;
    }

    case "expression": {
      const expression = element.expression || "null";
      elementContent = `<span${baseProps}>{${expression}}</span>`;
      break;
    }

    case "fragment": {
      const fragmentName = element.fragmentId || "Fragment";
      const params = element.params
        ? Object.entries(element.params)
            .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
            .join(" ")
        : "";
      elementContent = `<${fragmentName}${params ? " " + params : ""}/>`;
      break;
    }

    default:
      elementContent = `{/* Unknown element type: ${(element as any).type} */}`;
  }

  return repeatWrapper(conditionWrapper(elementContent));
}

function compileBaseElementProps(element: ElementData): string {
  const props: string[] = [];

  if (element.id) {
    props.push(`id="${element.id}"`);
  }

  if (element.name) {
    props.push(`data-name="${element.name}"`);
  }

  if (element.tag) {
    props.push(`data-tag="${element.tag}"`);
  }

  // Accessibility props
  if (element.ariaLabel) {
    props.push(
      `aria-label={${compileResolvableOrEvaluable(element.ariaLabel)}}`
    );
  }
  if (element.ariaHidden) {
    props.push(
      `aria-hidden={${compileResolvableOrEvaluable(element.ariaHidden)}}`
    );
  }
  if (element.ariaRole) {
    props.push(`role={${compileResolvableOrEvaluable(element.ariaRole)}}`);
  }
  if (element.tabIndex) {
    props.push(`tabIndex={${compileResolvableOrEvaluable(element.tabIndex)}}`);
  }

  // Event handlers (interactions)
  if (element.interactions) {
    Object.entries(element.interactions).forEach(([event, handler]) => {
      const eventName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
      props.push(`${eventName}={${compileResolvableOrEvaluable(handler)}}`);
    });
  }

  return props.length > 0 ? " " + props.join(" ") : "";
}

function compileResolvableOrEvaluable(value: any): string {
  if (typeof value === "object" && value !== null) {
    if (value.kind === "evaluable") {
      return value.expression || "undefined";
    }
    if (value.kind === "resolvable") {
      return value.value !== undefined
        ? JSON.stringify(value.value)
        : "undefined";
    }
  }
  return JSON.stringify(value);
}

function compileEvaluable(value: any): string {
  if (
    typeof value === "object" &&
    value !== null &&
    value.kind === "evaluable"
  ) {
    return value.expression || "false";
  }
  return JSON.stringify(value);
}

function compileRepeat(repeat: any, content: string): string {
  if (repeat.mode === "dynamic" && repeat.dataset) {
    const dataset = compileEvaluable(repeat.dataset);
    const alias = repeat.alias || "item";
    const indexAlias = repeat.indexAlias || "index";
    return `{${dataset}.map((${alias}, ${indexAlias}) => (${content}))}`;
  } else if (repeat.count) {
    const count = compileEvaluable(repeat.count);
    return `{Array.from({ length: ${count} }).map((_, index) => (${content}))}`;
  }
  return content;
}

function compileTextMarks(marks: any[], textContent: string): string {
  return marks.reduce((content, mark) => {
    const tag = mark.tag || "span";
    const markProps = compileBaseElementProps(mark);
    return `<${tag}${markProps}>{${content}}</${tag}>`;
  }, textContent);
}

function compileSlotFill(fill: any): string {
  const children =
    fill.content?.map((child: any) => compileElement(child)).join("") || "";
  return `<React.Fragment>${children}</React.Fragment>`;
}

function compileMediaElement(element: any): string {
  if (!element.media) return "";

  const { media } = element;
  const src = media.src ? compileResolvableOrEvaluable(media.src) : '""';

  if (media.type === "image") {
    const alt = media.alt ? compileEvaluable(media.alt) : '""';
    return `<img src={${src}} alt={${alt}} />`;
  } else if (media.type === "video") {
    const videoProps: string[] = [`src={${src}}`];

    if (media.autoplay)
      videoProps.push(`autoPlay={${compileEvaluable(media.autoplay)}}`);
    if (media.loop) videoProps.push(`loop={${compileEvaluable(media.loop)}}`);
    if (media.muted)
      videoProps.push(`muted={${compileEvaluable(media.muted)}}`);
    if (media.controls)
      videoProps.push(`controls={${compileEvaluable(media.controls)}}`);
    if (media.poster)
      videoProps.push(`poster={${compileResolvableOrEvaluable(media.poster)}}`);

    return `<video ${videoProps.join(" ")} />`;
  }

  return "";
}

function compileVectorProps(element: any): string {
  const props: string[] = [];

  if (element.width) {
    props.push(`width={${compileEvaluable(element.width)}}`);
  }
  if (element.height) {
    props.push(`height={${compileEvaluable(element.height)}}`);
  }
  if (element.viewBox) {
    props.push(`viewBox={${compileEvaluable(element.viewBox)}}`);
  }
  if (element.preserveAspectRatio) {
    props.push(
      `preserveAspectRatio={${compileEvaluable(element.preserveAspectRatio)}}`
    );
  }

  return props.length > 0 ? " " + props.join(" ") : "";
}

function compileVectorNode(node: any): string {
  if (node.type === "text") {
    return node.value || "";
  } else if (node.type === "element") {
    const tag = node.tagName || "g";
    const props = node.properties
      ? Object.entries(node.properties)
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ")
      : "";
    const children =
      node.children?.map((child: any) => compileVectorNode(child)).join("") ||
      "";
    return `<${tag}${props ? " " + props : ""}>${children}</${tag}>`;
  }
  return "";
}

export function compileComponent(data: ComponentData): string {
  const project = new Project();

  const sourceFile = project.createSourceFile("component.tsx", "", {
    overwrite: true,
  });

  const componentName = data.name || "Component";
  const propsTypeName = `${componentName}Props`;

  const propsType = tsTypeToTypeNode(
    data.props?.type || {
      kind: "typeLiteral",
      members: [],
    }
  );

  const states: string[] =
    data.states?.map((state) => {
      return compileState(state);
    }) ?? [];
  const content: string[] =
    data.content?.map((element) => {
      return compileElement(element);
    }) || [];
  const statements: string[] = [...states];

  if (content.length === 0) {
    statements.push(`return <></>;`);
  } else if (content.length === 1) {
    statements.push(`return ${content[0]};`);
  } else {
    statements.push(`return <>${content.join("")}</>;`);
  }

  sourceFile.addTypeAlias({
    isExported: true,
    name: propsTypeName,
    type: printTypeNode(propsType),
  });

  sourceFile.addFunction({
    name: componentName,
    parameters: [
      {
        name: "props",
        type: propsTypeName,
      },
    ],
    statements: statements,
  });

  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: "css",
        initializer: `\`\``,
      },
    ],
  });

  sourceFile.addExportAssignment({
    isExportEquals: false,
    expression: componentName,
  });

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
  });

  return sourceFile.getFullText();
}

import { useObservable } from "@elllphnt/elementa-utils";
import { DiagnosticSeverity, Namespace } from "@repo/elementa";
import React, { PropsWithChildren, useEffect } from "react";
import { combineLatest, Subscription } from "rxjs";
import { useNamespace } from "~/src/hooks/namespace";
import { Renderable } from "~/src/renderables/renderable";
import { ElementRenderable } from "../../../renderables/instances/element/element";

function ElementErrorFallback({ element }: { element: ElementRenderable }) {
  const name = useObservable(
    element.instance.entity.name$,
    element.instance.entity.name
  );

  useEffect(() => {
    return () => {
      element.setHtmlElement(null);
    };
  }, [element]);

  return (
    <div
      ref={(el) => {
        element.setHtmlElement(Renderable.defaultHtmlElementKey, el);
      }}
    >
      An error occurred in the element: {name || element.entity.id}
    </div>
  );
}

export class BaseElementErrorBoundary extends React.Component<
  PropsWithChildren<{
    element: ElementRenderable;
    namespace: Namespace;
  }>,
  {
    hasError: boolean;
  }
> {
  subscription: Subscription | null = null;

  constructor(
    props: PropsWithChildren<{
      element: ElementRenderable;
      namespace: Namespace;
    }>
  ) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidMount(): void {
    // clear error state when the element is updated
    this.subscription = combineLatest([
      this.props.element.entity.data$,
    ]).subscribe(() => {
      this.setState({ hasError: false });
    });
  }
  componentWillUnmount(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }

  componentDidUpdate(
    prevProps: Readonly<
      React.PropsWithChildren<{
        element: ElementRenderable;
        namespace: Namespace;
      }>
    >,
    prevState: Readonly<{ hasError: boolean }>,
    snapshot?: any
  ): void {
    if (
      this.props.element !== prevProps.element ||
      this.props.namespace !== prevProps.namespace
    ) {
      if (this.state.hasError) {
        this.setState({ hasError: false });
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const element = this.props.element;

    element.instance.setDiagnostics("rendering", [
      {
        severity: DiagnosticSeverity.Error,
        message: error.message,
        data: {
          error,
          info: errorInfo,
        },
      },
    ]);
  }

  render() {
    if (this.state.hasError) {
      return <ElementErrorFallback element={this.props.element} />;
    }

    return this.props.children;
  }
}

export function ElementErrorBoundary({
  element,
  children,
}: {
  element: ElementRenderable;
  children: React.ReactNode;
}) {
  const namespace = useNamespace();
  console.log(
    `Rendering ElementErrorBoundary ${element.entity.key} ${element.entity.name}`,
    namespace
  );
  return (
    <BaseElementErrorBoundary element={element} namespace={namespace}>
      {children}
    </BaseElementErrorBoundary>
  );
}

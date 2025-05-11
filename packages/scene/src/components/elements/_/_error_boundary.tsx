import { useObservable } from "@elllphnt/elementa-react-utils";
import { Namespace } from "@elllphnt/elementa-runtime";
import React, { PropsWithChildren, useEffect } from "react";
import { combineLatest, Subscription } from "rxjs";
import { useNamespace } from "../../../hooks/namespace.js";
import { ElementRenderable } from "../../../renderables/element/element.js";
import { Renderable } from "../../../renderables/renderable.js";

function ElementErrorFallback({ element }: { element: ElementRenderable }) {
  const name = useObservable(
    element.instance.element.name$,
    element.instance.element.name
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
      An error occurred in the element: {name || element.instance.element.id}
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
      this.props.element.instance.element.observable$,
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

    // element.instance.setDiagnostics("rendering", [
    //   {
    //     severity: DiagnosticSeverity.Error,
    //     message: error.message,
    //     data: {
    //       error,
    //       info: errorInfo,
    //     },
    //   },
    // ]);
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
  return (
    <BaseElementErrorBoundary element={element} namespace={namespace}>
      {children}
    </BaseElementErrorBoundary>
  );
}

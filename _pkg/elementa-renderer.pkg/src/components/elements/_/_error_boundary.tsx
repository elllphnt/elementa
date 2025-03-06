import { DiagnosticSeverity } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import React, { PropsWithChildren } from "react";
import { ElementRenderable } from "../../../renderables/instances/element/element";

function ElementErrorFallback({ element }: { element: ElementRenderable }) {
  const name = useObservable(
    element.instance.entity.name$,
    element.instance.entity.name,
  );
  return (
    <div>An error occurred in the element: {name || element.entity.id}</div>
  );
}

export class ElementErrorBoundary extends React.Component<
  PropsWithChildren<{
    element: ElementRenderable;
  }>,
  {
    hasError: boolean;
  }
> {
  constructor(props: PropsWithChildren<{ element: ElementRenderable }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
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

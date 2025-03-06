import React, { PropsWithChildren } from "react";
import { ErrorBoundary as _ErrorBoundary } from "react-error-boundary";

const ErrorBoundary = _ErrorBoundary as unknown as React.ComponentType<
  PropsWithChildren<{
    fallbackRender: (props: { error: Error }) => JSX.Element;
  }>
>;

export default ErrorBoundary;

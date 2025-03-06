import { PropsWithChildren } from "react";

export type ErrorFallBackProps = PropsWithChildren<{}>;

export function ErrorFallBack({ children }: ErrorFallBackProps): JSX.Element {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <p
        style={{
          textAlign: "center",
        }}
      >
        {children}
      </p>
    </div>
  );
}

export default ErrorFallBack;

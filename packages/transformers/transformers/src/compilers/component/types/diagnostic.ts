export enum TranspilerDiagnosticLevel {
  Info = "info",
  Warning = "warning",
  Error = "error",
}

export type TranspilerDiagnostic = {
  level: TranspilerDiagnosticLevel;
  message: string;
  data?: any;
};

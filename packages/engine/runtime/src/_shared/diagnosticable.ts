import type { Observable } from "rxjs";

export const DiagnosticLevel = {
  Info: 0,
  Warning: 1,
  Error: 2,
};

export interface DiagnosticEntry {
  level: number;
  message: string;
}

export interface Diagnostic {
  level: number;
  message: string;
  entries?: DiagnosticEntry[];
}

export interface Diagnosticable {
  diagnostics: Diagnostic[];
  diagnostics$: Observable<Diagnostic[]>;

  diagnosticLevel: number;
  diagnosticLevel$: Observable<number>;
}

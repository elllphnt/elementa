export type CodeGenerator = (names?: Record<string, string>) => string;
export type CompilerResult = {
  generate: CodeGenerator;
};
export type CompilerResultWithSource<
  T,
  C extends CompilerResult = CompilerResult
> = C & {
  source: T;
};

export type CompilerResult2 = {
  code: string;
};
export type CompilerResultWithSource2<T> = CompilerResult2 & {
  source: T;
};

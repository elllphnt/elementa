export type ConfigTemplateOptions = {
  outDir: string;
};

export function generateConfigFile({ outDir }: ConfigTemplateOptions): string {
  return [
    `const config = {`,
    `  outDir: "${outDir}",`,
    `};`,
    ``,
    `export default config;`,
  ].join("\n");
}

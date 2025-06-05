import { Project, SourceFile } from "ts-morph";

export function createSingleFileProject(
  source: string,
  { name }: { name?: string } = {}
): {
  project: Project;
  sourceFile: SourceFile;
} {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
  });

  const sourceFile = project.createSourceFile(name || "file.ts", source, {
    overwrite: true,
  });

  return { project, sourceFile };
}

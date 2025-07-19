import {
  createLocalFileSystem,
  createLocalFsInfrastructure,
  generateJsApp,
  makeLocalFsFileUrl,
} from "@elllphnt/elementa-assembler";

export async function generateApp({
  srcDir,
  outDir,
}: {
  srcDir: string;
  outDir: string;
}) {
  const srcDirParts = srcDir.split("/");
  const projectName = srcDirParts.pop();
  if (!projectName) {
    throw new Error("Invalid source directory: must contain a project name");
  }
  const infraPath = srcDirParts.join("/");
  const infra = createLocalFsInfrastructure(infraPath);
  const out = createLocalFileSystem(outDir);
  await generateJsApp({
    url: makeLocalFsFileUrl({
      projectName,
      path: ".elll/app",
    }),
    context: {
      infra,
      log: (level, message, meta) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${message}`, meta);
      },
      out,
      systemPackageName: "elll",
    },
  });
}

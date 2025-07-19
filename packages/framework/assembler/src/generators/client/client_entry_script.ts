export function generateClientEntryScript({
  routerPath,
}: {
  routerPath: string;
}): string {
  return [
    `import { startClient } from 'elll/client';`,
    `import { createRouter } from '${routerPath}';`,
    ``,
    `const router = createRouter();`,
    `startClient({ router });`,
  ].join("\n");
}

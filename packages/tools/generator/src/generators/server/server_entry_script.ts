export function generateServerEntryScript({
  routerPath,
}: {
  routerPath: string;
}): string {
  return [
    `import { render } from '@elllphnt/elll-runtime-server';`,
    `import { createRouter } from '${routerPath}';`,
    ``,
    `export default async function(request) {`,
    `  const url = new URL(request.url).pathname;`,
    `  const router = createRouter();`,
    ``,
    `  return render({router, url});`,
    `}`,
  ].join("\n");
}

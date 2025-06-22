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
    `  console.log("Request URL:", request.url);`,
    `  const url = new URL(request.url).pathname;`,
    `  const router = createRouter();`,
    ``,
    `  return render({router, url});`,
    `}`,
  ].join("\n");
}

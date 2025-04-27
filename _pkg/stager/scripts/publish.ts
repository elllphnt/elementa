import {
  assignArtifactVersion,
  GCSClient,
  publishArtifact,
  readManifest,
} from "@elllphnt/elll-artifacts";
import fs from "fs/promises";
import { build } from "./build";

export async function publish({
  version,
  environment = "dev",
}: {
  version: string;
  environment?: string;
}) {
  const artifact = "elementa-stager-2";
  const bucketName = "elllephant-prod-public-bucket";
  const gcsClient = new GCSClient({ bucketName });

  // read the current manifest
  const manifest = await readManifest({ artifact, gcsClient });

  // if version already exists, assign it to the environment
  if (manifest.versions.includes(version)) {
    await assignArtifactVersion({
      artifact,
      version,
      environment,
      gcsClient,
    });
    console.log(
      `Version ${version} already exists. Assigned to environment ${environment}.`,
    );
  } else {
    // otherwise, build and publish the new version

    await build({ outputPath: `build/index.js` });
    await publishArtifact({
      artifact,
      version,
      gcsClient,
      files: [
        {
          role: "main",
          localPath: "build/index.js",
          destinationPath: "index.js",
        },
      ],
    });
    await assignArtifactVersion({
      artifact,
      version,
      environment,
      gcsClient,
    });
    console.log(
      `Published ${artifact} v${version} to environment ${environment}.`,
    );
  }
}

async function main() {
  // get version from package.json
  const packageJson = JSON.parse(await fs.readFile("./package.json", "utf-8"));
  const version = packageJson.version;
  if (!version) {
    console.error("Version not found in package.json");
    process.exit(1);
  }

  // get environment from command line arguments
  const args = process.argv.slice(2);
  const envArg = args.find((arg) => arg.startsWith("--env="));
  const environment = envArg ? envArg.split("=")[1] : "dev";

  await publish({ version, environment });
}

if (require.main === module) {
  main()
    .then(() => {
      console.log("Publish completed successfully.");
    })
    .catch((error) => {
      console.error("Error during publish:", error);
      process.exit(1);
    });
}

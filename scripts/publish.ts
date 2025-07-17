import { getPackages } from "@manypkg/get-packages";
import { execSync } from "child_process";

function isVersionPublished(pkgName: string, version: string): boolean {
  try {
    execSync(`npm view ${pkgName}@${version}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

(async () => {
  const { packages } = await getPackages(process.cwd());

  for (const pkg of packages) {
    const { name, version, private: isPrivate, scripts } = pkg.packageJson;

    if (isPrivate) {
      console.log(`⏭️  Skipping private package: ${name}`);
      continue;
    }

    if (!scripts?.pub) {
      console.warn(`⚠️  No 'pub' script in ${name}, skipping.`);
      continue;
    }

    const alreadyPublished = isVersionPublished(name, version);
    if (alreadyPublished) {
      console.log(`📦 ${name}@${version} is already published. Skipping.`);
      continue;
    }

    console.log(`🚀 Publishing ${name}@${version}...`);

    try {
      execSync("npm run pub", {
        cwd: pkg.dir,
        stdio: "inherit",
      });
    } catch (err) {
      console.error(`❌ Failed to publish ${name}@${version}:`, err);
      process.exit(1);
    }
  }

  console.log("✅ Done publishing all packages.");
})();

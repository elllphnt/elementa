const fs = require("fs");
const path = require("path");

const inputDir = "src/types"; // ← root input folder
const outputFile = "dist/combined.txt"; // ← final output file
const allowedExtensions = [".ts", ".js", ".tsx", ".jsx"]; // ← filter by file type

function collectFilesRecursively(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(collectFilesRecursively(fullPath));
    } else if (
      entry.isFile() &&
      allowedExtensions.includes(path.extname(entry.name))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function concatFiles(inputDir, outputPath) {
  const files = collectFilesRecursively(inputDir).sort(); // optional sort for consistency
  let combined = "";

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    combined += `\n// ---- ${path.relative(inputDir, file)} ----\n`;
    combined += content + "\n";
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, combined);
  console.log(`✅ Combined ${files.length} files into ${outputPath}`);
}

concatFiles(inputDir, outputFile);

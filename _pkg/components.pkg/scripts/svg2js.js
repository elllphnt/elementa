const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const _ = require("lodash");

const directoryPath = "src/icons/elll";

// Asynchronous function to read and process SVG files
async function processSVGFiles(directory) {
  try {
    // Read files in the directory
    const files = fs.readdirSync(directory);
    const svgFiles = files.filter((file) => path.extname(file) === ".svg");
    const results = {
      16: {},
      20: {},
    };

    for (const file of svgFiles) {
      const filePath = path.join(directory, file);
      const svgContent = fs.readFileSync(filePath, "utf8");
      const result = await parseSVG(svgContent);
      const baseName = path.basename(file, ".svg");
      const fullName = `elll:${baseName}`;
      const key = _.camelCase(baseName.slice(0, -2));
      if (baseName.endsWith("16")) {
        results[16][key] = {
          name: fullName,
          viewBox: result.viewBox,
          fill: result.fill,
          data: result.data,
        };
      } else if (baseName.endsWith("20")) {
        results[20][key] = {
          name: fullName,
          viewBox: result.viewBox,
          fill: result.fill,
          data: result.data,
        };
      }
    }

    // Output the results as JSON
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Error processing SVG files:", err);
  }
}

// Function to parse SVG content and extract required data
async function parseSVG(svgContent) {
  try {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(svgContent);
    const svgElement = result.svg;
    const viewBox = svgElement.$.viewBox;
    const paths = svgElement.path || [];
    let data = "";
    let fill = false;

    // Check if fill is true
    if (paths.length > 0) {
      const style = paths[0].$.class && svgElement.defs[0].style[0];
      if (style && style.includes("fill: #")) {
        fill = true;
      }
      data = paths[0].$.d;
    }

    return { viewBox, fill, data };
  } catch (err) {
    console.error("Error parsing SVG:", err);
    return { viewBox: "", fill: false, data: "" };
  }
}

// Run the function with the directory path
processSVGFiles(directoryPath);

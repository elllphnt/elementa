import deepmerge from "deepmerge";
import fs from "fs";
import path from "path";

const combineMerge = (target: any, source: any, options: any) => {
  const destination = target.slice();

  source.forEach((item: any, index: number) => {
    if (typeof destination[index] === "undefined") {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = deepmerge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
};

export function merge<T, K>(target: T, source: K): T & K {
  return deepmerge(target as any, source as any, {
    arrayMerge: combineMerge,
  });
}

export function saveTestOutput(textId: string, data: any) {
  const timestamp = Date.now();
  const dir = path.resolve(__dirname, "../local", textId);
  const file = path.join(dir, `${timestamp}.json`);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

  console.log(`📝 Saved output to ${file}`);
}

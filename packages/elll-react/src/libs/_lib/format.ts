import prettier from "prettier";

export const formatTypescript = async function (script: string) {
  return await prettier.format(script, {
    parser: "typescript",
  });
};

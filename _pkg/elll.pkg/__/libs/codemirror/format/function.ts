import prettier from "prettier";

type Formatter = ({
  script,
  cursorOffset,
}: {
  script: string;
  cursorOffset: number;
}) => Promise<{ script: string; cursorOffset: number }>;

const formatTypescript: Formatter = async function ({ script, cursorOffset }) {
  const typescriptPlugin = await import(
    // @ts-ignore
    "https://unpkg.com/prettier@3.2.5/plugins/typescript.mjs"
  );
  const estreePlugin = await import(
    // @ts-ignore
    "https://unpkg.com/prettier@3.2.5/plugins/estree.mjs"
  );
  const formattedWithCursor = await prettier.formatWithCursor(script, {
    parser: "typescript",
    plugins: [typescriptPlugin, estreePlugin],
    cursorOffset,
  });
  return {
    script: formattedWithCursor.formatted,
    cursorOffset: formattedWithCursor.cursorOffset,
  };
};

function bumpVersion(script: string) {
  try {
    const json = JSON.parse(script);
    if (json._version) {
      json._version = json._version + 1;
    }
    return JSON.stringify(json, null, 2);
  } catch (e) {
    return script;
  }
}

const formatJson: Formatter = async function ({ script, cursorOffset }) {
  const estreePlugin = await import(
    // @ts-ignore
    "https://unpkg.com/prettier@3.2.5/plugins/estree.mjs"
  );
  const babelPlugin = await import(
    // @ts-ignore
    "https://unpkg.com/prettier@3.2.5/plugins/babel.mjs"
  );
  const formattedWithCursor = await prettier.formatWithCursor(
    bumpVersion(script),
    {
      parser: "json",
      plugins: [estreePlugin, babelPlugin],
      cursorOffset,
    },
  );
  return {
    script: formattedWithCursor.formatted,
    cursorOffset: formattedWithCursor.cursorOffset,
  };
};

export var prettifyXml = function (sourceXml: string) {
  var xmlDoc = new DOMParser().parseFromString(sourceXml, "application/xml");
  var xsltDoc = new DOMParser().parseFromString(
    [
      // describes how we want to modify the XML - indent everything
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '  <xsl:strip-space elements="*"/>',
      '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
      '    <xsl:value-of select="normalize-space(.)"/>',
      "  </xsl:template>",
      '  <xsl:template match="node()|@*">',
      '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
      "  </xsl:template>",
      '  <xsl:output indent="yes"/>',
      "</xsl:stylesheet>",
    ].join("\n"),
    "application/xml",
  );

  var xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  var resultXml = new XMLSerializer().serializeToString(resultDoc);
  return resultXml;
};

const formatXml: Formatter = async function ({ script, cursorOffset }) {
  // const xmlPlugin = await import(
  //   // @ts-ignore
  //   "https://esm.sh/@prettier/plugin-xml@3.4.1"
  // );
  // const formattedWithCursor = await prettier.formatWithCursor(script, {
  //   parser: "xml",
  //   plugins: [xmlPlugin],
  //   cursorOffset,
  // });
  return {
    script: prettifyXml(script),
    cursorOffset: cursorOffset,
  };
};

const formatterMap = new Map<string, Formatter>([
  ["typescript", formatTypescript],
  ["json", formatJson],
  ["xml", formatXml],
]);

export function formatScript({
  language,
  script,
  cursorOffset,
}: {
  language: string;
  script: string;
  cursorOffset: number;
}): Promise<{
  script: string;
  cursorOffset: number;
}> {
  const formatter = formatterMap.get(language);
  if (!formatter) {
    return Promise.resolve({ script, cursorOffset });
  } else {
    return formatter({ script, cursorOffset });
  }
}

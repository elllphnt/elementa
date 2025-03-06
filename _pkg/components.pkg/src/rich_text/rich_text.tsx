import { RichText, RichTextStyle } from "./_types";

/**
 * Map RichTextStyle properties to Tailwind classes for paragraphs.
 */
const getParagraphClasses = (style?: RichTextStyle): string => {
  const classes: string[] = [];

  if (!style) {
    // Default styling for paragraphs
    classes.push("el-mb-2");
    return classes.join(" ");
  }

  // Variant classes
  switch (style.variant) {
    case "h1":
      classes.push("el-text-3xl el-font-bold el-mb-4");
      break;
    case "h2":
      classes.push("el-text-2xl el-font-bold el-mb-3");
      break;
    case "h3":
      classes.push("el-text-xl el-font-bold el-mb-2");
      break;
    default:
      // "body" or undefined
      classes.push("el-text-base el-mb-2");
  }

  // Additional text styling
  if (style.bold) classes.push("el-font-bold");
  if (style.italic) classes.push("el-italic");
  if (style.underline) classes.push("el-underline");

  // Text color
  if (style.color) {
    // For a typical Tailwind color like "red-500", you could do:
    // classes.push(`text-${style.color}`);
    // If style.color might be a custom hex code or color variable, you can do:
    classes.push(`el-text-[${style.color}]`);
  }

  return classes.join(" ");
};

/**
 * Map RichTextStyle properties to Tailwind classes for spans.
 */
const getSpanClasses = (style?: RichTextStyle): string => {
  const classes: string[] = [];

  if (!style) return classes.join(" ");

  // We typically don’t use variant for spans unless you want
  // smaller headings inside paragraphs; ignoring variant by default.

  if (style.bold) classes.push("el-font-bold");
  if (style.italic) classes.push("el-italic");
  if (style.underline) classes.push("el-underline");
  if (style.color) {
    classes.push(`el-text-[${style.color}]`);
  }

  return classes.join(" ");
};

const RichTextRenderer = ({ richText }: { richText: RichText }) => {
  if (typeof richText === "string") {
    // A single string as the entire content
    return <p className="el-text-base el-mb-2">{richText}</p>;
  }

  // Otherwise, treat richText as RichTextParagraph[]
  return (
    <>
      {richText.map((paragraph, pIndex) => {
        // Paragraph classes
        const paragraphClasses = getParagraphClasses(paragraph.style);

        // If the paragraph content is just a string, print directly
        if (typeof paragraph.content === "string") {
          return (
            <p key={pIndex} className={paragraphClasses}>
              {paragraph.content}
            </p>
          );
        }

        // Otherwise, it's an array of RichTextSpan
        return (
          <p key={pIndex} className={paragraphClasses}>
            {paragraph.content.map((span, sIndex) => {
              const spanClasses = getSpanClasses(span.style);
              return (
                <span key={sIndex} className={spanClasses}>
                  {span.content}
                </span>
              );
            })}
          </p>
        );
      })}
    </>
  );
};

export default RichTextRenderer;

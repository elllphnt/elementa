export type VariableFontAxisData = {
  tag: string;
  start: number;
  end: number;
};

export type TypefaceDefinition = {
  family: string;
  srcset: {
    [variant: string]: string;
  };
  variants: string[];
  axes?: Array<VariableFontAxisData>;
  category?: string;
};

export type TypefaceData = {
  id: string;
  name: string;
  definition?: TypefaceDefinition;
  variants?: string[];
};

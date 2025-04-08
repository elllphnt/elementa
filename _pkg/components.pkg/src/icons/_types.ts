export type IconData = {
  name: string;
  viewBox?: string;
  height?: number;
  width?: number;
  stroke?: boolean;
  fill?: boolean;
  strokeWidth?: number;
  strokeLinecap?: "round" | "square" | "butt";
  strokeLinejoin?: "round" | "bevel" | "miter";
  fillRule?: "evenodd" | "nonzero" | "inherit";
  clipRule?: string | number;
  data?: string;
  content?: JSX.Element;
};

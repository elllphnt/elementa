import { memo } from "react";

// Memo with inline arrow function and compareProps
export default memo(
  ({ message }) => <div>{message}</div>,
  (prevProps, nextProps) => prevProps.message === nextProps.message
);

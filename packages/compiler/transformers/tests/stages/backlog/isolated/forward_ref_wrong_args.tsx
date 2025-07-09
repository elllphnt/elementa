import { forwardRef } from "react";

const Component = (props, ref) => {
  return <div ref={ref}>{props.message}</div>;
};

export default forwardRef(Component, "extraArg");

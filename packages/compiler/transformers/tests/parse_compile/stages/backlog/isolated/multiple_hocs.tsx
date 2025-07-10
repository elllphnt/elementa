import { forwardRef, memo } from "react";

const BaseComponent = (props, ref) => {
  return (
    <div ref={ref}>
      <p>{props.message}</p>
    </div>
  );
};

// Component wrapped in multiple HOCs
export default memo(forwardRef(BaseComponent));

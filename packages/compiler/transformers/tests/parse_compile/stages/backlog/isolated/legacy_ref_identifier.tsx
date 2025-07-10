import React from "react";

function Component(props, ref) {
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      console.log("Focus called");
    },
  }));

  return <div ref={ref}>Component with legacy ref</div>;
}

export default Component;

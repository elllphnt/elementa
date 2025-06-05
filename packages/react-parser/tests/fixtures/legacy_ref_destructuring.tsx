import React from "react";

function Component(props, { current }) {
  React.useEffect(() => {
    if (current) {
      console.log("Ref is available", current);
    }
  }, [current]);

  return <div>Component with destructured ref</div>;
}

export default Component;

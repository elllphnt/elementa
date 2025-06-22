import React from "react";

function Component(props) {
  // Invalid syntax (misplaced brackets)
  const value = if (props.condition) { 
    return 42;
  }
  
  return <div>Value: {value}</div>;
}

export default Component;

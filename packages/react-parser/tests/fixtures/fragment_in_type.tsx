import React from "react";

function Component() {
  // Type with fragment in type definition
  type FragmentType = React.ReactElement<{ children: React.ReactNode }>;

  // This fragment should be extracted
  return (
    <>
      <h1>Component with type annotations</h1>
      <p>This is a test</p>
    </>
  );
}

export default Component;

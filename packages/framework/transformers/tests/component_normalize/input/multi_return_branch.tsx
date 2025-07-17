import { useState } from "react";

function FragmentComponent(props) {
  const title: string = "Title";
  const [active, setTitle] = useState<boolean>(true);

  if (active) {
    return (
      <>
        <h1>{title}</h1>
        <div>Content</div>
      </>
    );
  } else {
    return (
      <>
        <h1>{title}</h1>
        <div>Content</div>
      </>
    );
  }
}

export default FragmentComponent;

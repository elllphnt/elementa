import { useEffect, useState } from "react";

function FragmentComponent(props) {
  const [title, setTitle] = useState("Title");

  useEffect(() => {
    setTitle("Updated Title");
  }, []);

  return (
    <>
      <h1>{title}</h1>
      <div>Content</div>
    </>
  );
}

export default FragmentComponent;

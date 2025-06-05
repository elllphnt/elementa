import { memo } from "react";

const Component = (props) => {
  return <div>{props.message}</div>;
};

export default memo(Component);

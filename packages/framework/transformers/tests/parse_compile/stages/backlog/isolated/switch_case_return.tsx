import React from "react";

function StatusMessage({ status }) {
  const [count, setCount] = React.useState(0);

  switch (status) {
    case "success":
      return <div>Operation successful!</div>;
    case "error":
      return <div>An error occurred!</div>;
    default:
      return <div>Unknown status</div>;
  }
}

export default StatusMessage;

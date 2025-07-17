const ArrowComponent = (props) => {
  const __fragment = "__fragment";
  const __defineFragment = "__defineFragment";

  return (
    <div>
      There are two reserved words in this component: {__fragment} and{" "}
      {__defineFragment}.
    </div>
  );
};

export default ArrowComponent;

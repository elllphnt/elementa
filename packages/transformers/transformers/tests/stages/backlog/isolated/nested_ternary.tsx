function Component({ status, isImportant }) {
  return (
    <div>
      {status === "success" ? (
        isImportant ? (
          <div>Important Success</div>
        ) : (
          <div>Normal Success</div>
        )
      ) : isImportant ? (
        <div>Important Error</div>
      ) : (
        <div>Normal Error</div>
      )}
    </div>
  );
}

export default Component;

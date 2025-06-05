function Component({ showLoading }) {
  if (showLoading) {
    return <div>Loading...</div>;
  }

  const message = "Content loaded";
  const timestamp = new Date().toISOString();

  return (
    <div>
      <h2>{message}</h2>
      <p>Loaded at: {timestamp}</p>
    </div>
  );
}

export default Component;

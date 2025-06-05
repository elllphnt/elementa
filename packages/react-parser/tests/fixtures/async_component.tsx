async function AsyncComponent() {
  // This is an async component
  // In real world this would await something, but for testing it's fine

  return (
    <div>
      <h1>Async Component</h1>
      <p>This component is async</p>
    </div>
  );
}

export default AsyncComponent;

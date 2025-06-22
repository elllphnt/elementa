function Component({ items }) {
  return (
    <div>
      <h2>Items:</h2>
      <p>{items.join(", ")}</p>
    </div>
  );
}

export default Component;

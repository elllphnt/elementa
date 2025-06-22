function Component({ items, target }) {
  for (let i = 0; i < items.length; i++) {
    if (items[i] === target) {
      return <div>Found item at position {i}</div>;
    }
  }

  const message = "Item not found";
  const count = items.length;

  return (
    <div>
      <h2>{message}</h2>
      <p>Searched through {count} items</p>
    </div>
  );
}

export default Component;

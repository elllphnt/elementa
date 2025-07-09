function Component({ showExtra }) {
  return (
    <div>
      <h1>Main Content</h1>
      {showExtra && (
        <>
          <h2>Extra Content</h2>
          <p>This is additional content that shows conditionally</p>
        </>
      )}
    </div>
  );
}

export default Component;

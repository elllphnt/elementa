export default function NestedFragments() {
  return (
    <>
      <h1>Main Title</h1>
      <div>
        {
          <>
            <h2>Nested Fragment</h2>
            <p>This is in a nested fragment</p>
          </>
        }
      </div>
      <footer>
        <>Footer content</>
      </footer>
    </>
  );
}

function NestedFragmentComponent(props) {
  __defineFragment("nested", () => (
    <>
      <h2>Nested Fragment</h2>
      <p>This is in a nested fragment</p>
    </>
  ));
  __defineFragment("qmku3nfda9", () => (
    <>
      <h2>Nested Fragment</h2>
      <p>This is in a nested fragment</p>
      <div>{__fragment("nested")}</div>
    </>
  ));
  return (
    <>
      <h1>Main Title</h1>
      <div>{__fragment("qmku3nfda9")}</div>
      <footer>
        <>Footer content</>
      </footer>
    </>
  );
}

export default NestedFragmentComponent;

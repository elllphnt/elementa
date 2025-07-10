function FragmentComponent(props) {
  const state_1 = (() => {
    const [title, setTitle] = useState("Title");
    useEffect(() => {
      setTitle("Updated Title");
    }, []);
    return { title };
  })();
  const state_2 = (() => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      setCount(1);
    }, []);
    return [count, setCount];
  })();
  const state_3 = (() => {
    const user = useState({ name: "John Doe", age: 30 });
    return user;
  })();
  const state_4 = (() => {
    return useState({ name: "John Doe", age: 30 });
  })();

  return (
    <>
      <h1>{state_1.title}</h1>
      <button onClick={() => state_2[1](state_2[0] + 1)}>
        Increment Count ({state_2[0]})
      </button>

      <p>
        User: {state_3.name}, Age: {state_3.age}
      </p>
      <p>
        User: {state_4.name}, Age: {state_4.age}
      </p>
      <div>Content</div>
    </>
  );
}
export default FragmentComponent;

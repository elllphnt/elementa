function HookComponent(props) {
  const { name } = useUser();
  const [count, setCount] = useState(0);
  const value = useMemo(() => count * 2, [count]);

  return (
    <div>
      Hello, {name}! <br />
      Count: {count}, Value: {value}
    </div>
  );
}

export default HookComponent;

function AliasedComponent({ userName: name, userAge: age }) {
  return (
    <div>
      <p>
        Name: {name}, Age: {age}
      </p>
    </div>
  );
}

export default AliasedComponent;

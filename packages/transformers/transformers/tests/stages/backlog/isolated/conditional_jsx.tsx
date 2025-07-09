function Component({ isAdmin }) {
  return (
    <div>
      {isAdmin ? (
        <div>
          <h1>Admin Panel</h1>
          <p>Welcome, administrator!</p>
        </div>
      ) : (
        <div>
          <h1>User View</h1>
          <p>Welcome, user!</p>
        </div>
      )}
    </div>
  );
}

export default Component;

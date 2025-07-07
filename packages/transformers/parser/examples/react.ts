import { mkdirSync, writeFileSync } from "fs";
import path, { dirname } from "path";
import { buildElllModule } from "../src/build.js";
import { parseCodeModule } from "../src/index.js";

const componentModule = `
import React, { useEffect, useState } from "react";
import { fetchUsers } from "../lib/api";
import clsx from "classnames";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

type UseUsersState = {
  loading: boolean;
  data: User[];
};

export function useUsers(): UseUsersState {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(users => {
      setData(users);
      setLoading(false);
    });
  }, []);

  return { loading, data };
}

export function formatUserEmail(email: string): string {
  return email.toLowerCase();
}

export function UserCard({ user }: { user: User }) {
  return (
    <div className="card">
      <img src={user.avatar} alt={user.name} className="avatar" />
      <h3>{user.name}</h3>
      <p>{formatUserEmail(user.email)}</p>
    </div>
  );
}

export function Dashboard() {
  const { loading, data } = useUsers();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <h1>User Directory</h1>
      <div className="grid">
        {data.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
`;

const module = parseCodeModule(componentModule);
const resources = await buildElllModule({
  module,
  getPath: async ({ path }) => path,
  relativePath: (_, to) => to,
});

const runkey = "" + Date.now();
for (const res of resources) {
  const filePath = path.join("local", "build-" + runkey, res.path + ".tsx");
  const dirPath = dirname(filePath);
  mkdirSync(dirPath, { recursive: true });
  writeFileSync(filePath, res.source);
}

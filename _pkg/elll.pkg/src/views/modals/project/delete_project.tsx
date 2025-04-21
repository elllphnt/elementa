import { useObservable } from "@repo/utils";
import cx from "classnames";
import { FormEvent, useState } from "react";
import { useRepository } from "~/src/hooks/backend/repository";

export function DeleteProjectModal() {
  const repository = useRepository();
  const name = useObservable(repository?.name$, repository?.name);
  const [confirmation, setConfimation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteWorkspace = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setDeleting(true);
      await repository?.delete();
      window.location.assign("/");
    } catch (e) {
      console.error(e);
      setError(
        "An error occurred while deleting the project. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const confirmed = confirmation === name;

  return (
    <form
      className="el-p-3 el-rounded el-space-y-3"
      style={{
        maxWidth: 400,
      }}
      onSubmit={handleDeleteWorkspace}
    >
      <p>
        Delete <strong>{name}</strong>
      </p>
      <div className="el-space-y-1">
        <p className="el-text-fg-400">
          Are you sure you want to delete this project? This action cannot be
          undone.
        </p>

        <p className="el-text-fg-400">
          To confirm deletion, type the name of the project in the field below.
        </p>
      </div>

      {error && <p className="el-text-red">{error}</p>}

      <input
        className="el-w-full el-px-2 el-py-1 el-border border-gray-200 el-rounded el-outline-none"
        placeholder={name}
        value={confirmation}
        onChange={(e) => setConfimation(e.target.value)}
      />

      <div className="el-flex el-gap-2 el-justify-end">
        <button
          type="submit"
          className={cx("el-rounded el-px-2 el-py-1", {
            "el-bg-red hover:el-bg-red-400 el-text-pm-ctr": confirmed,
            "el-bg-bg-200/50": !confirmed,
          })}
          disabled={!confirmed || deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </form>
  );
}

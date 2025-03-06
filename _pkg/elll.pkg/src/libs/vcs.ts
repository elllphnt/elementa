import _ from "lodash";

/**
 * Generates a diff between two commit records.
 *
 * It reads all the blobs from both commit records and compares them to output a CommitRecordDiff for each if there are any differences.
 * The diff of a blob pair is based on the sha of the blobs.
 *
 * The end result diff for the whole commit records is list of all the CommitRecordDiffs generated.
 *
 * @param from - The commit record to compare from.
 * @param to - The commit record to compare to.
 * @returns The diff between the two commit records.
 */
export function diffRecords(
  from: FlatCommitRecord,
  to: FlatCommitRecord,
): CommitRecordDiff {
  const diffs: CommitRecordDiff = [];

  const ids = _.uniq([...Object.keys(from), ...Object.keys(to)]);

  for (const id of ids) {
    let diff: BlobDiff = {
      id,
    };
    const fromBlob = from[id];
    const toBlob = to[id];

    if (fromBlob && toBlob) {
      if (fromBlob.type !== toBlob.type) {
        diff.modified = {
          ...diff.modified,
          type: true,
        };
      }
      if (fromBlob.sha !== toBlob.sha) {
        diff.modified = {
          ...diff.modified,
          blob: true,
        };
      }
      if (fromBlob.path !== toBlob.path) {
        diff.moved = {
          from: fromBlob.path,
          to: toBlob.path,
        };
      }
    } else if (fromBlob) {
      diff.deleted = true;
    } else {
      diff.created = true;
    }

    if (diff.created || diff.deleted || diff.modified || diff.moved) {
      diffs.push(diff);
    }
  }

  return diffs;
}

/**
 * A data structure that represents a file.
 */
export type BlobInfo = {
  /**
   * The type of the file.
   */
  type: string;

  /**
   * The path of the file in the virtual file system.
   */
  path: string;

  /**
   * The sha of the file.
   */
  sha: string;
};

/**
 * A data structure that represents a commit record.
 * records: a map of file id prefixes to other commit record shas
 * blobs: a map of file ids to blob data
 */
export type CommitRecord = {
  records: {
    [prefix: string]: {
      sha: string;
    };
  };
  blobs: {
    [id: string]: BlobInfo;
  };
};

/**
 * A flat representation of a commit record.
 */
export type FlatCommitRecord = CommitRecord["blobs"];

/**
 * A data structure that represents the modification of a blob between two versions of the file.
 */
export type BlobDiff = {
  id: string;
  created?: true;
  deleted?: true;
  modified?: {
    type?: true;
    blob?: true;
  };
  moved?: {
    from: string;
    to: string;
  };
};

/**
 * The diff of a commit record is just an array of blob diffs for each file in the commit record.
 */
export type CommitRecordDiff = Array<BlobDiff>;

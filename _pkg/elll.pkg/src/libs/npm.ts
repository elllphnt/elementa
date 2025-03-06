const npmCache = new Map<string, any>();

interface NpmSearchResult {
  objects: NpmSearchResultObject[];
  total: number;
  time: string;
}

interface NpmSearchResultObject {
  package: PackageDetails;
  flags: PackageFlags;
  score: PackageScore;
  searchScore: number;
}

export interface PackageDetails {
  name: string;
  scope: string;
  version: string;
  description: string;
  keywords: string[];
  date: string;
  links: PackageLinks;
  publisher: Person;
  maintainers: Person[];
  author?: Person;
}

interface PackageLinks {
  npm: string;
  homepage: string;
  repository: string;
  bugs?: string;
}

interface Person {
  username: string;
  email: string;
  name?: string;
  url?: string;
}

interface PackageFlags {
  insecure: number;
  unstable?: boolean;
}

interface PackageScore {
  final: number;
  detail: ScoreDetail;
}

interface ScoreDetail {
  quality: number;
  popularity: number;
  maintenance: number;
}

export interface NpmGetPackageResult {
  "_id": string;
  "_rev": string;
  "name": string;
  "description": string;
  "dist-tags": {
    latest: string;
  };
  "versions": { [version: string]: VersionDetails };
  "readme": string;
  "maintainers": Person[];
  "time": PackageTime;
  "author": Person;
  "users": { [username: string]: boolean };
  "readmeFilename": string;
}

interface VersionDetails {
  name: string;
  description: string;
  version: string;
  author: Person;
  main: string;
  dependencies: { [packageName: string]: string };
  engines: { [engineName: string]: string };
  licenses: License[];
  _npmUser: Person;
  _id: string;
  devDependencies: { [packageName: string]: string };
  _engineSupported: boolean;
  _npmVersion: string;
  _nodeVersion: string;
  _defaultsLoaded: boolean;
  dist: Distribution;
  maintainers: Person[];
}

interface License {
  type: string;
}

interface Distribution {
  shasum: string;
  tarball: string;
  integrity: string;
  signatures: Signature[];
}

interface Signature {
  keyid: string;
  sig: string;
}

interface PackageTime {
  modified: string;
  created: string;
  [version: string]: string;
}

async function fetchNpmPackages(query: string) {
  const res = await fetch(
    `https://registry.npmjs.org/-/v1/search?text=${query}`,
  );
  const data = (await res.json()) as NpmSearchResult;
  return data.objects.map((obj) => obj.package);
}
async function fetchNpmPackage(name: string) {
  const res = await fetch(`https://registry.npmjs.org/${name}`);
  const data = (await res.json()) as NpmGetPackageResult;
  return data;
}

export async function searchNpmPackages(query: string) {
  const cacheKey = `search:${query}`;
  if (npmCache.has(cacheKey)) {
    return npmCache.get(cacheKey)! as PackageDetails[];
  } else {
    const data = await fetchNpmPackages(query);
    npmCache.set(cacheKey, data);
    return data;
  }
}
export async function getNpmPackage(name: string) {
  const cacheKey = `package:${name}`;
  if (npmCache.has(cacheKey)) {
    return npmCache.get(cacheKey)! as NpmGetPackageResult;
  } else {
    const data = await fetchNpmPackage(name);
    npmCache.set(cacheKey, data);
    return data;
  }
}

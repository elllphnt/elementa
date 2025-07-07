import { getPackages } from "@manypkg/get-packages";

await getPackages(process.cwd()).then((result) => {
  console.log("Packages in the current directory:", result);
});

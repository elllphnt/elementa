import { ScrollArea } from "@repo/components";

function UtilitySetTable({ set }: { set: any }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Utility</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {/* {Object.entries(set.utilities ?? {}).map(([key, utility]) => (
          <tr key={utility.name}>
            <td>{utility.name}</td>
            <td>{JSON.stringify(utility.styles)}</td>
          </tr>
        ))} */}
      </tbody>
    </table>
  );
}

const UtilitySheetEditor = ({
  sets,
  onUpdate,
}: {
  sets: any[];
  onUpdate: () => void;
}) => {
  return (
    <ScrollArea scrollY>
      {sets.map((set) => (
        <UtilitySetTable key={set.name} set={set} />
      ))}
    </ScrollArea>
  );
};

export default UtilitySheetEditor;

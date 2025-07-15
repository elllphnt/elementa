import { Board } from "./components/board/board";
import { Explorer } from "./components/explorer/explorer";

export function Viewer() {
  return (
    <div className="flex h-screen relative">
      <div className="w-[280px] border-r border-fg-100 shrink-0">
        <Explorer />
      </div>
      <div className="flex-1">
        <Board />
      </div>
    </div>
  );
}

import { useState } from "react";

export default function HookReturn() {
  const content = useState("Hook content");
  return useState("Direct hook return");
}

import { GradientData } from "@elllphnt/elll-element";

export function GradientIcon({ gradient }: { gradient: GradientData }) {
  return (
    <div
      className="el-w-4 el-h-4 el-rounded-sm"
      style={{
        backgroundImage: `linear-gradient(${gradient.angle ?? 0}deg, ${gradient.stops?.map((stop) => `${stop.color} ${stop.position * 100}%`).join(", ")})`,
      }}
    />
  );
}

import { BrainCircuit } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <BrainCircuit className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-primary">InnerPeace</h1>
    </div>
  );
}

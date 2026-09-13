import { Activity } from "lucide-react";
import { cn } from "./ui/utils";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#101a16] text-white shadow-[0_10px_28px_rgba(16,26,22,0.18)]",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-x-1 bottom-1 h-5 rounded-full bg-primary/35 blur-md" />
      <Activity className="relative z-10 h-5 w-5 text-[#58df9e]" strokeWidth={2.4} />
    </div>
  );
}

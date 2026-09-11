import { cn } from "@/lib/utils";

export function MaterialIcon({
  name,
  filled = false,
  className,
  style,
}: {
  name: string;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", className)}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}`, ...style }}
    >
      {name}
    </span>
  );
}

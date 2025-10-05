import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AccentBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function AccentBadge({ children, className }: AccentBadgeProps) {
  return (
    <Badge
      className={cn(
        "bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30 transition-smooth",
        className
      )}
    >
      {children}
    </Badge>
  );
}

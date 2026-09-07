import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddRowButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function AddRowButton({
  onClick,
  label = "Agregar fila",
  className = "",
}: AddRowButtonProps) {
  return (
    <div className="shrink-0 px-3 py-3">
      <Button
        onClick={onClick}
        variant="ghost"
        className={`h-9 w-full justify-center gap-2 border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted hover:text-foreground ${className}`}
      >
        <Plus />
        {label}
      </Button>
    </div>
  );
}

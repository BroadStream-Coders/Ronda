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
    <div className="shrink-0 px-3 pb-3">
      <Button
        onClick={onClick}
        variant="ghost"
        className={`h-9 w-full justify-start gap-2 pl-1.5 text-muted-foreground hover:text-foreground ${className}`}
      >
        <Plus />
        {label}
      </Button>
    </div>
  );
}

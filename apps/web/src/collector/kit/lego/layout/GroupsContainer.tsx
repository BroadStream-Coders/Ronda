import { ReactNode } from "react";
import { AddColumnButton } from "../components/AddColumnButton";

interface GroupsContainerProps {
  children: ReactNode;
  onAddGroup: () => void;
  addLabel?: string;
  addSublabel?: string;
  className?: string;
}

export function GroupsContainer({
  children,
  onAddGroup,
  addLabel = "Agregar grupo",
  addSublabel,
}: GroupsContainerProps) {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden bg-muted/40">
      <div className="flex h-full min-w-max gap-3 p-4">
        {children}
        <AddColumnButton
          onClick={onAddGroup}
          label={addLabel}
          sublabel={addSublabel}
        />
      </div>
    </div>
  );
}

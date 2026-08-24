"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const BANDS = ["bg-primary/5", "bg-primary/12", "bg-primary/22"];

export interface HostColumn<T> {
  header: string;
  cell: (row: T, index: number) => ReactNode;
  width?: string;
  align?: "left" | "center";
  className?: string;
}

const headCell =
  "sticky top-0 z-10 border-b border-r border-border bg-muted px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase";

export function HostTable<T>({
  columns,
  rows,
  numbered = true,
}: {
  columns: HostColumn<T>[];
  rows: T[];
  numbered?: boolean;
}) {
  return (
    <table className="w-full border-separate border-spacing-0 border-l border-border">
      <thead>
        <tr>
          {numbered && (
            <th scope="col" className={cn(headCell, "w-16 text-center")}>
              N.º
            </th>
          )}
          {columns.map((column, index) => (
            <th
              key={index}
              scope="col"
              className={cn(
                headCell,
                column.width,
                column.align === "center" ? "text-center" : "text-left",
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className={BANDS[index % BANDS.length]}>
            {numbered && (
              <td className="border-b border-r border-border bg-muted/60 px-4 py-3 text-center align-middle text-base font-semibold tabular-nums text-muted-foreground">
                {index + 1}
              </td>
            )}
            {columns.map((column, columnIndex) => (
              <td
                key={columnIndex}
                className={cn(
                  "border-b border-r border-border px-4 py-3 align-middle",
                  column.align === "center" && "text-center",
                  column.className,
                )}
              >
                {column.cell(row, index)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

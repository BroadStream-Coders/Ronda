"use client";

import type { Dispatch, SetStateAction } from "react";
import { Trash2 } from "lucide-react";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowsContainer,
  getColumnData,
} from "@/collector/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_COURSES } from "./schema";

interface Level0Props {
  courses: string[];
  setCourses: Dispatch<SetStateAction<string[]>>;
}

export function Level0({ courses, setCourses }: Level0Props) {
  const addCourse = () => {
    if (courses.length >= MAX_COURSES) return;
    setCourses((prev) => [...prev, ""]);
  };

  const updateCourse = (index: number, value: string) =>
    setCourses((prev) => prev.map((c, i) => (i === index ? value : c)));

  const removeCourse = (index: number) =>
    setCourses((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="h-full overflow-y-hidden">
      <div className="flex min-w-max gap-4 px-6 py-6 h-full justify-center">
        <GroupColumn
          index={1}
          onRemove={() => setCourses([""])}
          currentCapacity={courses.length}
          maxCapacity={MAX_COURSES}
        >
          <RowsContainer>
            {courses.map((course, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-mono text-muted-foreground/50 select-none">
                  {index + 1}
                </div>

                <Input
                  value={course}
                  onChange={(e) => updateCourse(index, e.target.value)}
                  placeholder="Escribe el valor aquí..."
                  className="h-9 flex-1 rounded-lg bg-background border-border text-sm placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCourse(index)}
                  className="h-7 w-7 shrink-0 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </RowsContainer>

          <AddRowButton onClick={addCourse} label="Agregar valor" />

          <GroupFooter>
            <QuickLoad
              onLoad={(matrix) => setCourses(getColumnData(matrix, 0))}
              placeholder="Pega tus datos aquí..."
            />
          </GroupFooter>
        </GroupColumn>
      </div>
    </div>
  );
}

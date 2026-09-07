"use client";

import type { Dispatch, SetStateAction } from "react";
import { Trash2 } from "lucide-react";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  QuickLoad,
  RowCard,
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
              <RowCard
                key={index}
                index={index + 1}
                action={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeCourse(index)}
                    aria-label={`Eliminar valor ${index + 1}`}
                    className="h-8 w-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                }
              >
                <div className="flex min-w-0 flex-col justify-center">
                  <Input
                    value={course}
                    onChange={(e) => updateCourse(index, e.target.value)}
                    placeholder="Escribe el valor aquí..."
                  />
                </div>
              </RowCard>
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

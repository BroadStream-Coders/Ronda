"use client";

import { useCallback, useEffect, useState } from "react";
import { Layers, Shuffle } from "lucide-react";

import { loadJsonFile, saveAsJson } from "@/helpers/persistence";
import {LevelTabs, useWorkspaceHeader, notifyError } from "@/collector/kit";
import { Columns } from "./Columns";
import { Level0 } from "./Level0";
import { RowChoice, RowPairs, RowQa } from "./Rows";
import {
  BINARY_OPTIONS,
  MULTIPLE_OPTIONS,
  buildData,
  createEmptyChoiceRow,
  createEmptyColumn,
  createEmptyPairsRow,
  createEmptyQaRow,
  fromData,
  isData,
  parseBinaryPaste,
  parseMultiplePaste,
  parsePairsPaste,
  parseQaPaste,
  type ChoiceRow,
  type ColumnData,
  type Data,
  type PairsRow,
  type QaRow,
} from "./schema";

const createBinaryRow = () => createEmptyChoiceRow(2);
const createMultipleRow = () => createEmptyChoiceRow(4);

export function Editor() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [courses, setCourses] = useState<string[]>([""]);
  const [level1, setLevel1] = useState<ColumnData<ChoiceRow>[]>(() => [
    createEmptyColumn(createBinaryRow),
  ]);
  const [level2, setLevel2] = useState<ColumnData<ChoiceRow>[]>(() => [
    createEmptyColumn(createMultipleRow),
  ]);
  const [level3, setLevel3] = useState<ColumnData<PairsRow>[]>(() => [
    createEmptyColumn(createEmptyPairsRow),
  ]);
  const [level4, setLevel4] = useState<ColumnData<QaRow>[]>(() => [
    createEmptyColumn(createEmptyQaRow),
  ]);

  const handleGetData = useCallback(
    () => buildData({ courses, level1, level2, level3, level4 }),
    [courses, level1, level2, level3, level4],
  );

  const handleSave = useCallback(() => {
    try {
      saveAsJson("RetoCruzado.json", handleGetData());
    } catch {
      notifyError("Error al exportar los datos.");
    }
  }, [handleGetData]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const data = await loadJsonFile<Data>(file, isData);
      const loaded = fromData(data);
      setCourses(loaded.courses);
      setLevel1(loaded.level1);
      setLevel2(loaded.level2);
      setLevel3(loaded.level3);
      setLevel4(loaded.level4);
    } catch {
      notifyError("Archivo de Reto Cruzado no válido.");
    }
  }, []);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Reto Cruzado",
      icon: <Shuffle className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      getData: handleGetData,
    });
  }, [setHeader, handleSave, handleLoad, handleGetData]);

  return (
    <LevelTabs
      levels={[
        {
          name: "Nivel 0",
          icon: Layers,
          component: <Level0 courses={courses} setCourses={setCourses} />,
        },
        {
          name: "Nivel 1",
          icon: Layers,
          component: (
            <Columns
              columns={level1}
              setColumns={setLevel1}
              createEmptyRow={createBinaryRow}
              parsePaste={parseBinaryPaste}
              pastePlaceholder="Pegar: pregunta (col 1) + dos respuestas (col 2 y 3)…"
              renderRow={({ row, index, onChange, onRemove }) => (
                <RowChoice
                  index={index}
                  data={row}
                  options={BINARY_OPTIONS}
                  onChange={onChange}
                  onRemove={onRemove}
                />
              )}
            />
          ),
        },
        {
          name: "Nivel 2",
          icon: Layers,
          component: (
            <Columns
              columns={level2}
              setColumns={setLevel2}
              createEmptyRow={createMultipleRow}
              parsePaste={parseMultiplePaste}
              pastePlaceholder="Pegar por bloques de 5 líneas: pregunta, respuesta correcta y 3 distractores…"
              renderRow={({ row, index, onChange, onRemove }) => (
                <RowChoice
                  index={index}
                  data={row}
                  options={MULTIPLE_OPTIONS}
                  onChange={onChange}
                  onRemove={onRemove}
                />
              )}
            />
          ),
        },
        {
          name: "Nivel 3",
          icon: Layers,
          component: (
            <Columns
              columns={level3}
              setColumns={setLevel3}
              createEmptyRow={createEmptyPairsRow}
              parsePaste={parsePairsPaste}
              pastePlaceholder="Pegar pares (col 1 y col 2); cada 3 filas forman una pregunta…"
              renderRow={({ row, index, onChange, onRemove }) => (
                <RowPairs
                  index={index}
                  data={row}
                  onChange={onChange}
                  onRemove={onRemove}
                />
              )}
            />
          ),
        },
        {
          name: "Nivel 4",
          icon: Layers,
          component: (
            <Columns
              columns={level4}
              setColumns={setLevel4}
              createEmptyRow={createEmptyQaRow}
              parsePaste={parseQaPaste}
              pastePlaceholder="Pegar: pregunta (col 1) + respuesta (col 2)…"
              renderRow={({ row, index, onChange, onRemove }) => (
                <RowQa
                  index={index}
                  data={row}
                  onChange={onChange}
                  onRemove={onRemove}
                />
              )}
            />
          ),
        },
      ]}
    />
  );
}

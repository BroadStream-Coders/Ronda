"use client";

import { useState } from "react";
import { FileJson, FileArchive } from "lucide-react";

import { saveAsJson, saveAsZip } from "@/helpers/persistence";
import { Button } from "@/components/ui/button";

export default function TestingPage() {
  const [text, setText] = useState("");
  const data = { text };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Testing · persistencia
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escribe algo, guárdalo como JSON o como ZIP (con el JSON adentro) y abre
          el archivo para verificar que el contenido es correcto.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe aquí…"
        className="min-h-40 w-full rounded-md border bg-background p-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      <div className="flex gap-2">
        <Button onClick={() => saveAsJson("test.json", data)}>
          <FileJson /> Guardar JSON
        </Button>
        <Button variant="outline" onClick={() => saveAsZip("test.zip", data)}>
          <FileArchive /> Guardar ZIP
        </Button>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PAIRS_PER_ROW, type ChoiceRow, type PairsRow, type QaRow } from "./schema";

const inputClass =
  "h-8 w-full border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary";

const questionClass =
  "h-[68px] min-h-[68px] resize-none w-full border-border bg-background px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary";

function RowFrame({
  index,
  onRemove,
  children,
}: {
  index: number;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/30">
      <div className="grid grid-cols-[2rem_1fr] items-start gap-2 w-full">
        <div className="flex flex-col gap-1 w-full shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-full rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <Trash2 className="size-4" />
          </Button>
          <div className="flex h-8 w-full items-center justify-center rounded border border-border bg-muted/30 text-xs font-mono font-medium text-muted-foreground">
            {index + 1}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

interface RowChoiceProps {
  index: number;
  data: ChoiceRow;
  options: { label: string; placeholder: string }[];
  onChange: (updates: Partial<ChoiceRow>) => void;
  onRemove: () => void;
}

export function RowChoice({
  index,
  data,
  options,
  onChange,
  onRemove,
}: RowChoiceProps) {
  const updateAnswer = (answerIndex: number, value: string) =>
    onChange({
      answers: data.answers.map((answer, i) =>
        i === answerIndex ? value : answer,
      ),
    });

  return (
    <RowFrame index={index} onRemove={onRemove}>
      <Textarea
        value={data.question}
        onChange={(e) => onChange({ question: e.target.value })}
        placeholder="Ingrese la pregunta..."
        className={questionClass}
      />

      {options.map((option, optionIndex) => (
        <RowChoiceOption
          key={option.label}
          label={option.label}
          placeholder={option.placeholder}
          value={data.answers[optionIndex] || ""}
          isCorrect={data.correctIndex === optionIndex}
          onSelect={() => onChange({ correctIndex: optionIndex })}
          onValueChange={(value) => updateAnswer(optionIndex, value)}
        />
      ))}
    </RowFrame>
  );
}

function RowChoiceOption({
  label,
  placeholder,
  value,
  isCorrect,
  onSelect,
  onValueChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  isCorrect: boolean;
  onSelect: () => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <>
      <button
        onClick={onSelect}
        className={`flex h-8 w-full items-center justify-center rounded border text-xs font-bold font-mono transition-colors ${
          isCorrect
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50"
        }`}
      >
        {label}
      </button>
      <Input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </>
  );
}

interface RowPairsProps {
  index: number;
  data: PairsRow;
  onChange: (updates: Partial<PairsRow>) => void;
  onRemove: () => void;
}

export function RowPairs({ index, data, onChange, onRemove }: RowPairsProps) {
  const pairs = Array.from(
    { length: PAIRS_PER_ROW },
    (_, i) => data.pairs?.[i] || { leftText: "", rightText: "" },
  );

  const updatePair = (
    pairIndex: number,
    field: "leftText" | "rightText",
    value: string,
  ) =>
    onChange({
      pairs: pairs.map((pair, i) =>
        i === pairIndex ? { ...pair, [field]: value } : pair,
      ),
    });

  return (
    <RowFrame index={index} onRemove={onRemove}>
      <div className="flex flex-col gap-2 w-full">
        {pairs.map((pair, pairIndex) => (
          <div key={pairIndex} className="grid grid-cols-2 gap-2 w-full">
            <Input
              value={pair.leftText}
              onChange={(e) => updatePair(pairIndex, "leftText", e.target.value)}
              placeholder={`Col A (Par ${pairIndex + 1})`}
              className={inputClass}
            />
            <Input
              value={pair.rightText}
              onChange={(e) =>
                updatePair(pairIndex, "rightText", e.target.value)
              }
              placeholder={`Col B (Par ${pairIndex + 1})`}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </RowFrame>
  );
}

interface RowQaProps {
  index: number;
  data: QaRow;
  onChange: (updates: Partial<QaRow>) => void;
  onRemove: () => void;
}

export function RowQa({ index, data, onChange, onRemove }: RowQaProps) {
  return (
    <RowFrame index={index} onRemove={onRemove}>
      <Textarea
        value={data.question}
        onChange={(e) => onChange({ question: e.target.value })}
        placeholder="Ingrese la pregunta..."
        className={questionClass}
      />

      <div className="h-8 w-full" />

      <Input
        value={data.answer}
        onChange={(e) => onChange({ answer: e.target.value })}
        placeholder="Ingrese la respuesta..."
        className={inputClass}
      />
    </RowFrame>
  );
}

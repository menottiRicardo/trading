"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  type Answer,
  answerChoiceKey,
} from "@/lib/checklist";

interface QuestionStepProps {
  title: string;
  subtitle?: string;
  answers: [Answer, Answer];
  selected: string | undefined;
  onSelect: (value: string) => void;
}

export function QuestionStep({
  title,
  subtitle,
  answers,
  selected,
  onSelect,
}: QuestionStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      <RadioGroup value={selected ?? ""} onValueChange={onSelect}>
        {answers.map((answer, i) => {
          const choice = answerChoiceKey(answer);
          const id = `answer-${i}`;
          const isSelected = selected === choice;
          return (
            <Label
              key={choice}
              htmlFor={id}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-lg border px-4 py-3 transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/40"
              )}
            >
              <RadioGroupItem id={id} value={choice} />
              <span className="flex-1 text-sm font-medium">{answer.label}</span>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

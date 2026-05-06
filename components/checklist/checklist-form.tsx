"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ImageUpload } from "@/components/ui/image-upload";

import {
  answerChoiceKey,
  buildSummary,
  END_OK,
  FORCED_END_MESSAGE,
  FORCED_END_TITLE,
  QUESTION_IDS,
  STEPS_BY_ID,
  type Direction,
  type EndStep as EndStepType,
  type InfoStep as InfoStepType,
  type QuestionStep as QuestionStepType,
} from "@/lib/checklist";
import { useTrades } from "@/hooks/use-trades";

import { EndStep } from "./end-step";
import { InfoStep } from "./info-step";
import { QuestionStep } from "./question-step";

const FIRST_STEP = "q1";

export function ChecklistForm() {
  const router = useRouter();
  const { addTrade } = useTrades();

  const [currentId, setCurrentId] = useState(FIRST_STEP);
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [forced, setForced] = useState(false);

  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  const step = STEPS_BY_ID[currentId];

  // progress: how many question steps have been answered so far
  const answeredQuestions = QUESTION_IDS.filter((id) => id in answers).length;
  const progress = Math.round((answeredQuestions / QUESTION_IDS.length) * 100);

  // ── Navigation helpers ────────────────────────────────────────────────────

  const goTo = useCallback((nextId: string, saveToHistory = true) => {
    if (saveToHistory) {
      setHistory((h) => [...h, currentId]);
    }
    setCurrentId(nextId);
  }, [currentId]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentId(prev);
  }, [history]);

  const resetForm = useCallback(() => {
    setCurrentId(FIRST_STEP);
    setHistory([]);
    setAnswers({});
    setImages([]);
    setSaved(false);
    setForced(false);
  }, []);

  // ── Question answer ───────────────────────────────────────────────────────

  const selectAnswer = useCallback(
    (questionId: string, answerNext: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answerNext }));
    },
    []
  );

  const advance = useCallback(() => {
    if (step.kind === "question") {
      const raw = answers[step.id];
      if (!raw) return;
      const qs = step as QuestionStepType;
      const chosen = qs.answers.find((a) => answerChoiceKey(a) === raw);
      const nextId = chosen?.next;
      if (!nextId) return;
      goTo(nextId);
    } else if (step.kind === "info") {
      goTo((step as InfoStepType).next);
    }
  }, [step, answers, goTo]);

  const forceContinue = useCallback(() => {
    if (step.kind !== "end") return;
    const target = (step as EndStepType).overrideNext;
    if (!target) return;
    setForced(true);
    goTo(target);
  }, [step, goTo]);

  // ── Save trade ────────────────────────────────────────────────────────────

  const saveAndFinish = useCallback(async () => {
    if (saved) return;
    const summary = forced
      ? "Trade forzado fuera de las reglas."
      : buildSummary(answers);
    const direction = (answers["q4"] as Direction) ?? "bajista";
    await addTrade({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      answers,
      direction,
      summary,
      outcome: "pending",
      pnl: 0,
      notas: "",
      images,
      tags: [],
      forced,
    });
    setSaved(true);
    toast.success("Trade guardado en el historial");
  }, [saved, forced, answers, images, addTrade]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;

      if (step.kind === "question") {
        const qs = step as QuestionStepType;
        if (e.key === "1")
          selectAnswer(step.id, answerChoiceKey(qs.answers[0]));
        if (e.key === "2")
          selectAnswer(step.id, answerChoiceKey(qs.answers[1]));
        if (e.key === "Enter") advance();
      } else if (step.kind === "info" && e.key === "Enter") {
        advance();
      } else if (step.kind === "end" && e.key === "Enter") {
        const es = step as EndStepType;
        if (es.outcome === "blocked" && es.overrideNext) {
          forceContinue();
        } else if (es.id === END_OK && !saved) {
          saveAndFinish();
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, answers, advance, selectAnswer, saved, saveAndFinish, forceContinue]);

  // Focus primary button on step change
  useEffect(() => {
    primaryBtnRef.current?.focus();
  }, [currentId]);

  // ── Render ────────────────────────────────────────────────────────────────

  const isEnd = step.kind === "end";
  const endStep = isEnd ? (step as EndStepType) : null;
  // isSaveEnd: the step where we present the final save UI (always END_OK)
  const isSaveEnd = endStep?.id === END_OK;
  // When the user forced through at least one block and lands on END_OK,
  // show the negative outcome copy instead of the success copy.
  const isForcedBadEnd = isSaveEnd && forced;
  const endOutcome: "ok" | "blocked" = isForcedBadEnd ? "blocked" : (endStep?.outcome ?? "ok");
  const endTitle = isForcedBadEnd ? FORCED_END_TITLE : (endStep?.title ?? "");
  const resolvedMessage = isSaveEnd
    ? (isForcedBadEnd ? FORCED_END_MESSAGE : buildSummary(answers))
    : (endStep?.message ?? "");

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Progress bar */}
      <Progress value={progress} className="h-1" />

      <Card className="overflow-hidden shadow-sm">
        <CardContent
          className="p-6 pt-8 pb-4"
          aria-live="polite"
          key={currentId}
        >
          {step.kind === "question" && (
            <QuestionStep
              title={(step as QuestionStepType).title}
              subtitle={(step as QuestionStepType).subtitle}
              answers={(step as QuestionStepType).answers}
              selected={answers[step.id]}
              onSelect={(val) => selectAnswer(step.id, val)}
            />
          )}

          {step.kind === "info" && (
            <InfoStep
              title={(step as InfoStepType).title}
              body={(step as InfoStepType).body}
            />
          )}

          {step.kind === "end" && (
            <div className="flex flex-col gap-6">
              <EndStep
                outcome={endOutcome}
                title={endTitle}
                message={resolvedMessage}
              />
              {isSaveEnd && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Imágenes (opcional)
                  </p>
                  <ImageUpload images={images} onChange={setImages} />
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter
          className={cn(
            "flex items-center gap-2 border-t px-6 py-4",
            history.length > 0 ? "justify-between" : "justify-end"
          )}
        >
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
              <ArrowLeft className="size-4" />
              Atrás
            </Button>
          )}

          {/* Primary action */}
          {!isEnd && (
            <Button
              ref={primaryBtnRef}
              onClick={advance}
              disabled={
                step.kind === "question" && !answers[step.id]
              }
            >
              Continuar
            </Button>
          )}

          {isEnd && isSaveEnd && !saved && (
            <Button ref={primaryBtnRef} onClick={saveAndFinish}>
              Guardar trade
            </Button>
          )}

          {isEnd && isSaveEnd && saved && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>
                Nuevo trade
              </Button>
              <Button
                ref={primaryBtnRef}
                onClick={() => router.push("/history")}
              >
                Ver historial
              </Button>
            </div>
          )}

          {isEnd && endStep?.outcome === "blocked" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm}>
                Empezar de nuevo
              </Button>
              {endStep.overrideNext && (
                <Button ref={primaryBtnRef} variant="destructive" onClick={forceContinue}>
                  Continuar de todos modos
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

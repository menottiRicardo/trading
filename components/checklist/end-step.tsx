"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EndStepProps {
  outcome: "ok" | "blocked";
  title: string;
  message: string;
}

export function EndStep({ outcome, title, message }: EndStepProps) {
  const isOk = outcome === "ok";

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "flex items-center gap-3",
          isOk ? "text-emerald-500" : "text-destructive"
        )}
      >
        {isOk ? (
          <CheckCircle2 className="size-8 shrink-0" />
        ) : (
          <XCircle className="size-8 shrink-0" />
        )}
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      {message && (
        <p className="text-muted-foreground">{message}</p>
      )}
    </div>
  );
}

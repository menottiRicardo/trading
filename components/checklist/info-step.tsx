"use client";

interface InfoStepProps {
  title: string;
  body: string;
}

export function InfoStep({ title, body }: InfoStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="whitespace-pre-line text-muted-foreground">{body}</p>
    </div>
  );
}

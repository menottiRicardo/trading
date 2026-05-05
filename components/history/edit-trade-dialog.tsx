"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import {
  buildOutcomePrompt,
  TRADE_TAGS,
  type Outcome,
  type TradeRecord,
  type TradeTag,
} from "@/lib/checklist";

interface EditTradeDialogProps {
  trade: TradeRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    outcome: Outcome,
    pnl: number,
    notas: string,
    images: string[],
    tags: string[]
  ) => void;
  onDelete: (id: string) => void;
}

// Keyed inner form — resets state whenever the trade changes.
function TradeForm({
  trade,
  onSave,
  onDelete,
  onClose,
}: {
  trade: TradeRecord;
  onSave: (
    id: string,
    outcome: Outcome,
    pnl: number,
    notas: string,
    images: string[],
    tags: string[]
  ) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [outcome, setOutcome] = useState<Outcome>(trade.outcome);
  const [amount, setAmount] = useState(
    trade.pnl !== 0 ? String(Math.abs(trade.pnl)) : ""
  );
  const [notas, setNotas] = useState(trade.notas ?? "");
  const [images, setImages] = useState<string[]>(trade.images ?? []);
  const [tags, setTags] = useState<string[]>(trade.tags ?? []);

  function toggleTag(tag: TradeTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSave() {
    const raw = parseFloat(amount);
    const abs = isNaN(raw) ? 0 : Math.abs(raw);
    const signed = outcome === "loss" ? -abs : outcome === "win" ? abs : 0;
    onSave(trade.id, outcome, signed, notas.trim(), images, tags);
    onClose();
  }

  function handleDelete() {
    onDelete(trade.id);
    onClose();
  }

  const outcomeOptions: { value: Outcome; label: string }[] = [
    { value: "pending", label: "Pendiente" },
    { value: "win", label: "Ganado" },
    { value: "loss", label: "Perdido" },
  ];

  return (
    <>
      <div className="flex flex-col gap-5 py-2">
        <p className="text-base font-medium">{buildOutcomePrompt(trade)}</p>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Resultado
          </Label>
          <RadioGroup
            value={outcome}
            onValueChange={(v) => setOutcome(v as Outcome)}
            className="flex gap-3"
          >
            {outcomeOptions.map((opt) => (
              <Label
                key={opt.value}
                htmlFor={`outcome-${opt.value}`}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors has-data-checked:border-primary has-data-checked:bg-primary/5"
              >
                <RadioGroupItem
                  id={`outcome-${opt.value}`}
                  value={opt.value}
                />
                {opt.label}
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Etiquetas
          </Label>
          <div className="flex flex-wrap gap-2">
            {TRADE_TAGS.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <Badge
                  key={tag}
                  asChild
                  variant={selected ? "default" : "outline"}
                  className="text-xs font-normal"
                >
                  <button type="button" onClick={() => toggleTag(tag)}>
                    {tag}
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="pnl-amount"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Monto ({outcome === "loss" ? "-" : "+"}$)
          </Label>
          <Input
            id="pnl-amount"
            type="number"
            min={0}
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="trade-notas"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Notas
          </Label>
          <Textarea
            id="trade-notas"
            placeholder="Agrega tus observaciones sobre este trade..."
            rows={6}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Imágenes
          </Label>
          <ImageUpload images={images} onChange={setImages} />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="ghost"
          size="sm"
          className="mr-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="size-4" />
          Eliminar
        </Button>
        <Button onClick={handleSave}>Guardar</Button>
      </DialogFooter>
    </>
  );
}

export function EditTradeDialog({
  trade,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EditTradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar trade</DialogTitle>
        </DialogHeader>

        {trade && (
          <TradeForm
            key={trade.id}
            trade={trade}
            onSave={onSave}
            onDelete={onDelete}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

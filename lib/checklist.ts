export type Direction = "bajista" | "alcista";
export type Outcome = "pending" | "win" | "loss";

export const TRADE_TAGS = [
  "Buen Modelo",
  "FOMO",
  "Venganza",
  "Ansiedad",
] as const;
export type TradeTag = (typeof TRADE_TAGS)[number];

export interface TradeRecord {
  id: string;
  createdAt: number;
  answers: Record<string, string>;
  direction: Direction;
  summary: string;
  outcome: Outcome;
  pnl: number;
  notas: string;
  images: string[];
  tags: string[];
  /** True when the user overrode one or more blocking steps to record the trade anyway. */
  forced?: boolean;
}

// ─── Step types ───────────────────────────────────────────────────────────────

interface BaseStep {
  id: string;
}

export interface Answer {
  label: string;
  /** id of the next step, or a terminal outcome key */
  next: string;
  /** Unique choice id for radios when two answers share the same `next` (e.g. structure question). */
  value?: string;
}

export interface QuestionStep extends BaseStep {
  kind: "question";
  title: string;
  subtitle?: string;
  answers: [Answer, Answer];
}

export interface InfoStep extends BaseStep {
  kind: "info";
  title: string;
  body: string;
  next: string;
}

export interface EndStep extends BaseStep {
  kind: "end";
  /** "ok" means the trade looks good and should be saved */
  outcome: "ok" | "blocked";
  title: string;
  /** may reference ${direction} resolved at render time */
  message: string;
  /** If set, "Continuar de todos modos" jumps to this step id. */
  overrideNext?: string;
}

export type Step = QuestionStep | InfoStep | EndStep;

// ─── Terminal step IDs ────────────────────────────────────────────────────────

export const END_NO_STRUCT = "end-no-struct";
export const END_POWER_HOUR = "end-power-hour";
export const END_OFF_HOURS = "end-off-hours";
export const END_OK = "end-ok";
export const INFO_NO_CONTEXT = "info-no-context";
export const INFO_NO_PD = "info-no-pd";

// ─── Step machine ─────────────────────────────────────────────────────────────

export const STEPS: Step[] = [
  {
    id: "q1",
    kind: "question",
    title: "¿Tienes el contexto del daily?",
    answers: [
      { label: "Sí", next: "q2" },
      { label: "No", next: INFO_NO_CONTEXT },
    ],
  },
  {
    id: INFO_NO_CONTEXT,
    kind: "info",
    title: "Sin contexto del daily",
    body: "Si no tienes el contexto solo puedes tomar un trade si tienes una estructura clara en una hora.",
    next: "q2",
  },
  {
    id: "q2",
    kind: "question",
    title: "¿Tienes una estructura clara?",
    subtitle:
      "Estructura clara: Estructura alcista esperando que el precio solo rebalance una ineficiencia para entrar en 5m\n\nEstructura NO clara:\n- El precio está acumulando",
    answers: [
      { label: "Sí", next: "q3" },
      { label: "No", next: END_NO_STRUCT },
    ],
  },
  {
    id: END_NO_STRUCT,
    kind: "end",
    outcome: "blocked",
    title: "No puedes tomar un trade",
    message: "Espera otra sesión o otro día.",
    overrideNext: "q3",
  },
  {
    id: "q3",
    kind: "question",
    title: "¿Tienes el PD array encargado de la estructura?",
    answers: [
      { label: "Sí", next: "q4" },
      { label: "No", next: INFO_NO_PD },
    ],
  },
  {
    id: INFO_NO_PD,
    kind: "info",
    title: "Sin PD array",
    body: "Si no tienes el PD array encargado de la estructura, ¿cómo sabes que tu estructura está correcta? ¿Y cómo sabes hasta qué punto llegará?",
    next: "q4",
  },
  {
    id: "q4",
    kind: "question",
    title: "¿Cuál es la estructura?",
    answers: [
      { label: "Bajista", next: "q5", value: "bajista" },
      { label: "Alcista", next: "q5", value: "alcista" },
    ],
  },
  {
    id: "q5",
    kind: "question",
    title: "¿El pre market tuvo una vela loca o tenemos noticia de FOMC?",
    answers: [
      { label: "Sí", next: END_POWER_HOUR },
      { label: "No", next: "q6" },
    ],
  },
  {
    id: END_POWER_HOUR,
    kind: "end",
    outcome: "blocked",
    title: "Espera el Power Hour",
    message: "Deja que el mercado digiera el movimiento antes de operar.",
    overrideNext: "q6",
  },
  {
    id: "q6",
    kind: "question",
    title: "¿Estamos en horario operable?",
    subtitle: "Sesión AM 9:30 – 11:30 | Power Hour 3:00 – 4:00 PM",
    answers: [
      { label: "Sí", next: END_OK },
      { label: "No", next: END_OFF_HOURS },
    ],
  },
  {
    id: END_OFF_HOURS,
    kind: "end",
    outcome: "blocked",
    title: "No puedes tomar un trade",
    message: "Espera el tiempo para operar.",
    overrideNext: END_OK,
  },
  {
    id: END_OK,
    kind: "end",
    outcome: "ok",
    title: "Este trade se ve bien",
    // message is built dynamically by buildSummary
    message: "",
  },
];

export const STEPS_BY_ID = Object.fromEntries(STEPS.map((s) => [s.id, s]));

/** Question step IDs in order — used to compute progress */
export const QUESTION_IDS = STEPS.filter((s) => s.kind === "question").map(
  (s) => s.id
);

// ─── Forced-bad end copy ──────────────────────────────────────────────────────

export const FORCED_END_TITLE = "Este trade no se ve bien";
export const FORCED_END_MESSAGE =
  "Lo más seguro es que perdiste dinero. Tómalo con calma y mañana es otro día.";

// ─── Summary builder ──────────────────────────────────────────────────────────

export function buildSummary(answers: Record<string, string>): string {
  const dir = answers["q4"] as Direction | undefined;
  const buyOrSell = dir === "bajista" ? "Buy stops" : "Sell Stops";
  const setupDir = dir === "bajista" ? "Ventas" : "Compras";
  return `Este trade se ve bien, espera una neutralización de liquidez en 5m de ${buyOrSell} para esperar el setup de ${setupDir}.`;
}

/** Stable radio / stored value for an answer (unique even when `next` repeats). */
export function answerChoiceKey(a: Answer): string {
  return a.value ?? a.next;
}

// ─── Outcome prompt ───────────────────────────────────────────────────────────

/** Returns a contextual "how did it go?" prompt for the edit dialog. */
export function buildOutcomePrompt(trade: TradeRecord): string {
  const lowProb =
    trade.forced ||
    trade.answers["q1"] === INFO_NO_CONTEXT ||
    trade.answers["q3"] === INFO_NO_PD;
  return lowProb
    ? "Este trade no era de alta probabilidad, ¿funcionó?"
    : "Este trade parecía ganador, ¿cómo te fue?";
}

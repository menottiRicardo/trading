import { ChecklistForm } from "@/components/checklist/checklist-form";

export const metadata = { title: "Nuevo Trade – Trading Checklist" };

export default function NewTradePage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <ChecklistForm />
    </main>
  );
}

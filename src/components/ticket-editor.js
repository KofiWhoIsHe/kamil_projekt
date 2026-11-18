"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import { STATUSES } from "@/lib/options";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  status: z.enum(STATUSES.map((s) => s.value), { message: "Wybierz status" }),
  comment: z.string().max(500, "Komentarz może mieć max. 500 znaków"),
});

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30";

export function TicketEditor({ ticket, onSaved }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: ticket.status || "nowe",
      comment: ticket.comment || "",
    },
  });

  async function onSubmit(values) {
    try {
      await pb.collection("tickets").update(ticket.id, values);
      toast.success("Zgłoszenie zaktualizowane");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się zapisać zmian");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 p-2 sm:grid-cols-[200px_1fr_auto] sm:items-end">
      <div>
        <Label htmlFor={`status-${ticket.id}`}>Status</Label>
        <select id={`status-${ticket.id}`} className={selectClass} {...register("status")}>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {errors.status && <p className="mt-1 text-sm text-destructive">{errors.status.message}</p>}
      </div>
      <div>
        <Label htmlFor={`comment-${ticket.id}`}>Komentarz</Label>
        <Textarea id={`comment-${ticket.id}`} rows={2} {...register("comment")} />
        {errors.comment && <p className="mt-1 text-sm text-destructive">{errors.comment.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Zapisywanie..." : "Zapisz"}
      </Button>
    </form>
  );
}
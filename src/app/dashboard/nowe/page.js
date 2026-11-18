"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import { ROOMS, CATEGORIES, PRIORITIES } from "@/lib/options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_SIZE = 5 * 1024 * 1024;

const schema = z.object({
  title: z.string().min(3, "Tytuł musi mieć min. 3 znaki").max(100, "Tytuł może mieć max. 100 znaków"),
  description: z.string().min(10, "Opisz problem w min. 10 znakach"),
  room: z.string().min(1, "Wybierz salę"),
  category: z.string().min(1, "Wybierz kategorię"),
  priority: z.string().min(1, "Wybierz priorytet"),
  image: z
    .any()
    .refine((f) => !f || f.length === 0 || f[0].size <= MAX_SIZE, "Zdjęcie może ważyć max. 5 MB")
    .refine((f) => !f || f.length === 0 || f[0].type.startsWith("image/"), "Dozwolone są tylko obrazy"),
});

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30";

function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-sm text-destructive">{error.message}</p>;
}

export default function NewTicketPage() {
  const router = useRouter();

useEffect(() => {
  if (!pb.authStore.isValid) {
    router.push("/login");
    return;
  }
  if (pb.authStore.record?.role === "technician") router.push("/technician");
}, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", room: "", category: "", priority: "sredni" },
  });

  async function onSubmit(values) {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("room", values.room);
      formData.append("category", values.category);
      formData.append("priority", values.priority);
      formData.append("status", "nowe");
      formData.append("author", pb.authStore.record.id);
      if (values.image && values.image.length > 0) {
        formData.append("image", values.image[0]);
      }

      await pb.collection("tickets").create(formData);
      toast.success("Zgłoszenie zostało dodane");
      router.push("/dashboard/historia");
    } catch (err) {
      toast.error("Nie udało się dodać zgłoszenia. Spróbuj ponownie.");
      console.error(err);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
        ← Wróć
      </Link>

      <Card className="mt-3">
        <CardHeader>
          <CardTitle>Nowa usterka</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Tytuł</Label>
              <Input id="title" placeholder="np. Nie działa rzutnik" {...register("title")} />
              <FieldError error={errors.title} />
            </div>

            <div>
              <Label htmlFor="description">Opis</Label>
              <Textarea id="description" rows={4} placeholder="Co dokładnie się dzieje?" {...register("description")} />
              <FieldError error={errors.description} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="room">Sala</Label>
                <select id="room" className={selectClass} {...register("room")}>
                  <option value="">Wybierz...</option>
                  {ROOMS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <FieldError error={errors.room} />
              </div>

              <div>
                <Label htmlFor="category">Kategoria</Label>
                <select id="category" className={selectClass} {...register("category")}>
                  <option value="">Wybierz...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <FieldError error={errors.category} />
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Priorytet</Label>
              <select id="priority" className={selectClass} {...register("priority")}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <FieldError error={errors.priority} />
            </div>

            <div>
              <Label htmlFor="image">Zdjęcie (opcjonalnie, max 5 MB)</Label>
              <Input id="image" type="file" accept="image/*" {...register("image")} />
              <FieldError error={errors.image} />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { CATEGORIES, STATUS_LABELS } from "@/lib/options";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  if (pb.authStore.record?.role === "technician") {
  router.push("/technician");
  return;
}
    async function load() {
      try {
        // reguły API w PocketBase zwrócą tylko zgłoszenia zalogowanego użytkownika
        const res = await pb.collection("tickets").getList(1, 50, { sort: "-created" });
        const token = await pb.files.getToken();
        setTickets(
          res.items.map((t) => ({
            ...t,
            imageUrl: t.image ? pb.files.getURL(t, t.image, { token }) : null,
          }))
        );
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać zgłoszeń.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label ?? v;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
        ← Wróć
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Moje zgłoszenia</h1>

      {loading && <p className="mt-4 text-muted-foreground">Ładowanie...</p>}
      {error && <p className="mt-4 text-destructive">{error}</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="mt-4 text-muted-foreground">Nie masz jeszcze żadnych zgłoszeń.</p>
      )}

      <div className="mt-4 space-y-3">
        {tickets.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{t.title}</CardTitle>
                <Badge variant={t.status === "zamkniete" ? "secondary" : "default"}>
                  {STATUS_LABELS[t.status] ?? "Nowe"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{t.description}</p>
              <p className="text-muted-foreground">
                Sala: {t.room} · {categoryLabel(t.category)} · Priorytet: {t.priority}
              </p>
              <p className="text-muted-foreground">
                Dodano: {new Date(t.created).toLocaleString("pl-PL")}
              </p>
              {t.comment && <p className="mt-2 rounded-md bg-muted p-2">Komentarz technika: {t.comment}</p>}
              {t.imageUrl && (
                <a href={t.imageUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                  Zobacz zdjęcie
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
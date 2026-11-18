"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import { ROOMS, PRIORITIES, STATUSES, CATEGORIES } from "@/lib/options";
import { AppHeader } from "@/components/app-header";
import { TicketEditor } from "@/components/ticket-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30";

export default function TechnicianPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [filters, setFilters] = useState({ status: "", room: "", priority: "" });

  const load = useCallback(async () => {
    try {
      const items = await pb
        .collection("tickets")
        .getFullList({ sort: "-created", expand: "author" });
      const token = await pb.files.getToken();
      setTickets(
        items.map((t) => ({
          ...t,
          imageUrl: t.image ? pb.files.getURL(t, t.image, { token }) : null,
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się pobrać zgłoszeń");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/login");
      return;
    }
    if (pb.authStore.record?.role !== "technician") {
      router.push("/dashboard");
      return;
    }
    setReady(true);
    load();
  }, [router, load]);

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        const status = t.status || "nowe";
        return (
          (!filters.status || status === filters.status) &&
          (!filters.room || t.room === filters.room) &&
          (!filters.priority || t.priority === filters.priority)
        );
      }),
    [tickets, filters]
  );

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const label = (list, v) => list.find((x) => x.value === v)?.label ?? v;

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold">Zgłoszenia usterek</h1>
        <p className="mt-1 text-muted-foreground">
          Wyświetlono {filtered.length} z {tickets.length}
        </p>

        <div className="mt-6 grid gap-4 rounded-xl border bg-background p-4 sm:grid-cols-4 sm:items-end">
          <div>
            <Label htmlFor="f-status">Status</Label>
            <select id="f-status" className={selectClass} value={filters.status} onChange={setFilter("status")}>
              <option value="">Wszystkie</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="f-room">Sala</Label>
            <select id="f-room" className={selectClass} value={filters.room} onChange={setFilter("room")}>
              <option value="">Wszystkie</option>
              {ROOMS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="f-priority">Priorytet</Label>
            <select id="f-priority" className={selectClass} value={filters.priority} onChange={setFilter("priority")}>
              <option value="">Wszystkie</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => setFilters({ status: "", room: "", priority: "" })}>
            Wyczyść filtry
          </Button>
        </div>

        <div className="mt-6 rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tytuł</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Priorytet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Dodano</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Ładowanie...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Brak zgłoszeń pasujących do filtrów.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((t) => (
                <Fragment key={t.id}>
                  <TableRow>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>{t.room}</TableCell>
                    <TableCell>{label(CATEGORIES, t.category)}</TableCell>
                    <TableCell>
                      <Badge variant={t.priority === "wysoki" ? "destructive" : "outline"}>
                        {label(PRIORITIES, t.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(t.status || "nowe") === "zamkniete" ? "secondary" : "default"}>
                        {label(STATUSES, t.status || "nowe")}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.expand?.author?.name || "—"}</TableCell>
                    <TableCell>{new Date(t.created).toLocaleDateString("pl-PL")}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenId(openId === t.id ? null : t.id)}
                      >
                        {openId === t.id ? "Zwiń" : "Szczegóły"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {openId === t.id && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/40">
                        <p className="mb-2 text-sm">{t.description}</p>
                        {t.imageUrl && (
                          <a href={t.imageUrl} target="_blank" rel="noreferrer" className="mb-3 inline-block text-sm text-primary underline">
                            Zobacz zdjęcie
                          </a>
                        )}
                        <TicketEditor
                          ticket={t}
                          onSaved={() => {
                            setOpenId(null);
                            load();
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
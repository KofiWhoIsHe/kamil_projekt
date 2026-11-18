"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

useEffect(() => {
  if (!pb.authStore.isValid) {
    router.push("/login");
    return;
  }
  if (pb.authStore.record?.role === "technician") {
    router.push("/technician");
    return;
  }
  setUser(pb.authStore.record);
}, [router]);

  function logout() {
    pb.authStore.clear();
    toast.success("Wylogowano");
    router.push("/login");
  }

  if (!user) return null;

  const options = [
    {
      href: "/dashboard/nowe",
      icon: "➕",
      title: "Dodaj usterkę",
      desc: "Zgłoś zepsuty sprzęt lub problem w sali. Możesz dołączyć zdjęcie.",
    },
    {
      href: "/dashboard/historia",
      icon: "📋",
      title: "Moja historia",
      desc: "Zobacz swoje zgłoszenia, ich status i komentarze techników.",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold">🛠️ Szkolny Helpdesk</span>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Wyloguj się
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold">Cześć, {user.name || user.email}! 👋</h1>
        <p className="mt-2 text-muted-foreground">Co chcesz dzisiaj zrobić?</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {options.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              className="block rounded-2xl border bg-background p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:ring-2 hover:ring-primary"
            >
              <div className="text-4xl">{o.icon}</div>
              <h2 className="mt-4 text-xl font-semibold">{o.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{o.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
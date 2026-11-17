"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { pb } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";

export default function TicketsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Moje zgłoszenia</h1>
      <p>Zalogowano jako: {user.email}</p>
      <Button
        onClick={() => {
          pb.authStore.clear();
          router.push("/login");
        }}
      >
        Wyloguj
      </Button>
    </main>
  );
}
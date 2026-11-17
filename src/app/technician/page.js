"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { pb } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";

export default function TechnicianPage() {
  const { user, ready, isTechnician } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (!isTechnician) router.replace("/tickets");
  }, [ready, user, isTechnician, router]);

  if (!ready || !user || !isTechnician) return null;

  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Panel technika</h1>
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
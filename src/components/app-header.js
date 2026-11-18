"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(pb.authStore.record);
  }, []);

  function logout() {
    pb.authStore.clear();
    toast.success("Wylogowano");
    router.push("/login");
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold">🛠️ Szkolny Helpdesk</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.name || user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Wyloguj się
          </Button>
        </div>
      </div>
    </header>
  );
}
"use client";

import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => (pb.authStore.isValid ? pb.authStore.record : null);
    setUser(read());
    setReady(true);
    const unsubscribe = pb.authStore.onChange(() => setUser(read()));
    return unsubscribe;
  }, []);

  return { user, ready, isTechnician: user?.role === "technician" };
}
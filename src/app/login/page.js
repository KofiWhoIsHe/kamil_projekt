"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const schema = z.object({
  email: z.string().min(1, "Podaj adres e-mail").email("Niepoprawny adres e-mail"),
  password: z.string().min(1, "Podaj hasło"),
});

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (pb.authStore.isValid) {
      router.push(
        pb.authStore.record?.role === "technician" ? "/technician" : "/dashboard"
      );
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      const auth = await pb
        .collection("users")
        .authWithPassword(values.email, values.password);
      toast.success("Zalogowano");
      router.push(auth.record.role === "technician" ? "/technician" : "/dashboard");
    } catch {
      toast.error("Nieprawidłowy e-mail lub hasło");
    }
  }
      return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Szkolny Helpdesk
        </h1>
        <p className="mt-2 text-muted-foreground">
          System zgłaszania usterek w szkole
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Logowanie</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logowanie..." : "Zaloguj się"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <Link href="/register" className="underline">
                Zarejestruj się
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
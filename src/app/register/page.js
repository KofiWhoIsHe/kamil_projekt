"use client";

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

const schema = z
  .object({
    name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
    email: z.string().min(1, "Podaj adres e-mail").email("Niepoprawny adres e-mail"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    passwordConfirm: z.string().min(1, "Powtórz hasło"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Hasła nie są takie same",
    path: ["passwordConfirm"],
  });

const fields = [
  { id: "name", label: "Imię", type: "text" },
  { id: "email", label: "E-mail", type: "email" },
  { id: "password", label: "Hasło", type: "password" },
  { id: "passwordConfirm", label: "Powtórz hasło", type: "password" },
];

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      await pb.collection("users").create(values);
      await pb.collection("users").authWithPassword(values.email, values.password);
      toast.success("Konto utworzone");
      router.push("/tickets");
    } catch (err) {
      const emailError = err?.response?.data?.email?.message;
      toast.error(
        emailError ? "Ten adres e-mail jest już zajęty" : "Nie udało się utworzyć konta"
      );
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
          <CardTitle>Rejestracja</CardTitle>
          <CardDescription>Utwórz nowe konto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {fields.map((f) => (
              <div key={f.id} className="space-y-2">
                <Label htmlFor={f.id}>{f.label}</Label>
                <Input id={f.id} type={f.type} {...register(f.id)} />
                {errors[f.id] && (
                  <p className="text-sm text-destructive">{errors[f.id].message}</p>
                )}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Tworzenie konta..." : "Zarejestruj się"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Masz już konto?{" "}
              <Link href="/login" className="underline">
                Zaloguj się
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
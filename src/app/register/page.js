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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z
  .object({
    name: z.string().min(2, "Podaj imię (min. 2 znaki)"),
    email: z.string().min(1, "Podaj adres e-mail").email("Niepoprawny adres e-mail"),
    password: z.string().min(8, "Hasło musi mieć min. 8 znaków"),
    passwordConfirm: z.string().min(1, "Powtórz hasło"),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Hasła nie są takie same",
    path: ["passwordConfirm"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      // UWAGA: nie wysyłamy pola "role"
      await pb.collection("users").create({
        name: values.name,
        email: values.email,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
      });
      await pb.collection("users").authWithPassword(values.email, values.password);
      toast.success("Konto utworzone");
      router.push("/dashboard");
    } catch (err) {
      console.error(err?.response);
      const data = err?.response?.data;
      if (data?.email) toast.error("Ten e-mail jest już zajęty lub niepoprawny");
      else if (data?.password) toast.error("Hasło jest niepoprawne (min. 8 znaków)");
      else toast.error("Nie udało się utworzyć konta");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Rejestracja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {[
              ["name", "Imię", "text"],
              ["email", "E-mail", "email"],
              ["password", "Hasło", "password"],
              ["passwordConfirm", "Powtórz hasło", "password"],
            ].map(([field, label, type]) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{label}</Label>
                <Input id={field} type={type} {...register(field)} />
                {errors[field] && (
                  <p className="text-sm text-destructive">{errors[field].message}</p>
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
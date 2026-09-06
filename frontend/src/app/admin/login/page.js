"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ShieldCheck } from "lucide-react";
import { loginSchema } from "@/lib/validators";
import { useAuth } from "@/hooks/useAuth";
import { Label, Input, FieldError } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const { status, login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (status === "authenticated") router.replace("/admin");
  }, [status, router]);

  const onSubmit = async (values) => {
    const { error } = await login(values.email, values.password);
    if (error) {
      setError("password", { type: "server", message: error });
      return;
    }
    router.replace("/admin");
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5" style={{ background: "linear-gradient(160deg, #2b0a54 0%, #12051f 45%, #3d0f45 100%)" }}>
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-24 top-0 h-80 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(147,51,234,0.4), transparent)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(224,51,159,0.28), transparent)" }}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="overflow-hidden rounded-2xl bg-neon-gradient p-px shadow-neon">
          <div className="rounded-[15px] border border-line bg-bg-soft p-8">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-accent-faint text-accent-strong">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-cream">
              Admin login
            </h1>
            <p className="mt-1.5 text-sm text-cream-faint">
              Sign in to manage your portfolio
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || status === "loading"}>
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Signing in…
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>
          </div>
        </div>
        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-widest text-cream-faint">
          Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
}
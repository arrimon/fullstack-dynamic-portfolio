"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { contactSchema } from "@/lib/validators";
import { publicPost } from "@/lib/api";
import { Label, Input, Textarea, FieldError } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function ContactForm() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  const onSubmit = async (values) => {
    setStatus("loading");
    setError("");
    const { data, error: err } = await publicPost("/api/contact", values);
    if (err) {
      setStatus("error");
      setError(err);
      return;
    }
    setStatus("success");
    reset();
  };

  return (
    <div className="relative">
      <div className="sr-only" aria-hidden="true">
        <input
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-accent/30 bg-accent-faint px-8 py-20 text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-bg text-accent-strong"
          >
            <CheckCircle2 className="h-8 w-8" />
          </motion.span>
          <h3 className="mt-6 text-2xl font-semibold tracking-tight text-cream">
            Message sent
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-cream-muted">
            Thanks for reaching out. I’ll get back to you as soon as I can.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-8"
            onClick={() => setStatus("idle")}
          >
            Send another message
          </Button>
        </motion.div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name" required>
                Name
              </Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Project inquiry"
              aria-invalid={!!errors.subject}
              {...register("subject")}
            />
            <FieldError>{errors.subject?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="message" required>
              Message
            </Label>
            <Textarea
              id="message"
              rows={6}
              placeholder="Tell me about your project or idea..."
              aria-invalid={!!errors.message}
              {...register("message")}
            />
            <FieldError>{errors.message?.message}</FieldError>
          </div>

          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" size="lg" disabled={status === "loading"} arrow>
            {status === "loading" ? (
              <>
                <Spinner className="h-4 w-4" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send message
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
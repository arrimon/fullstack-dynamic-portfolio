"use client";

import { useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { adminPost } from "@/lib/admin";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";

const MIN_PASSWORD_LENGTH = 8;

export default function AccountManager() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setBusy(true);
    const res = await adminPost("/account/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    setBusy(false);

    if (res.error) {
      setError(res.error === "UNAUTHORIZED" ? "Your session has expired." : res.error);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({
      title: "Password updated",
      description: "Use your new password next time you log in.",
      variant: "success",
    });
  };

  return (
    <div>
      <PageHeader
        title="Account"
        description="Manage your admin login credentials."
      />

      <div className="max-w-md rounded-xl border border-line bg-bg-soft p-6">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
          Change password
        </p>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label htmlFor="current_password">Current password</Label>
            <Input
              id="current_password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="mt-1.5 text-xs text-cream-faint">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          </div>

          <div>
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <FieldError>{error}</FieldError>}

          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Updating…
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Update password
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-line bg-bg-muted p-3 text-xs text-cream-faint">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Your session stays active after changing the password. The change
            applies on your next login.
          </p>
        </div>
      </div>
    </div>
  );
}
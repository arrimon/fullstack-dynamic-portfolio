"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, FileText, Upload } from "lucide-react";
import axios from "axios";
import { publicGet } from "@/lib/api";
import { mediaUrl, formatFullDate } from "@/lib/utils";
import { resumeSchema } from "@/lib/validators";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";

export default function ResumeManager() {
  const { toast } = useToast();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [versionLabel, setVersionLabel] = useState("");
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    const { data } = await publicGet("/api/resume");
    setResume(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFile = (selected) => {
    const f = selected?.[0];
    if (!f) return;
    const result = resumeSchema.safeParse({ file: f, version_label: versionLabel });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid file");
      return;
    }
    setError("");
    setFile(f);
  };

  const submit = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    if (versionLabel.trim()) formData.append("version_label", versionLabel.trim());

    setUploading(true);
    try {
      await axios.post("/api/admin/resume", formData);
      toast({ title: "Resume uploaded", description: "The previous resume was deactivated.", variant: "success" });
      setFile(null);
      setVersionLabel("");
      if (inputRef.current) inputRef.current.value = "";
      setLoading(true);
      load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast({
        title: "Upload failed",
        description: typeof detail === "string" ? detail : "The file must be a PDF under 5MB.",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Resume"
        description="Upload your resume as a PDF. The latest upload becomes the active one."
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-line bg-bg-soft p-6">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
              Current resume
            </p>
            {resume ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/30 bg-accent-faint text-accent-strong">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-cream">
                      <CheckCircle2 className="h-4 w-4 text-accent-strong" />
                      {resume.version_label || "Resume.pdf"} — Active
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-cream-faint">
                      Uploaded {formatFullDate(resume.uploaded_at)}
                    </p>
                  </div>
                </div>
                <Button href={mediaUrl(resume.file_url)} size="sm" variant="secondary" target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No active resume"
                description="Upload a PDF below to make it publicly available."
              />
            )}
          </div>

          <div className="rounded-xl border border-line bg-bg-soft p-6">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
              Upload new version
            </p>
            <div className="space-y-5">
              <div>
                <Label htmlFor="version_label">Version label (optional)</Label>
                <Input
                  id="version_label"
                  placeholder="e.g. v2.1 — Frontend Engineer"
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                />
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line-strong px-6 py-10 text-center transition-colors hover:border-accent"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files)}
                />
                <Upload className="mb-3 h-7 w-7 text-accent-strong" />
                <p className="text-sm font-medium text-cream">
                  {file ? file.name : "Click to choose a PDF"}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
                  PDF — max 5MB
                </p>
              </div>

              {error && <FieldError>{error}</FieldError>}

              <div className="flex justify-end">
                <Button onClick={submit} disabled={!file || uploading}>
                  {uploading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
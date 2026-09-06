"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Replace, Trash2, Upload, CheckCircle2 } from "lucide-react";
import { adminDelete } from "@/lib/admin";
import { uploadProjectImages } from "@/lib/uploadProjectImage";
import { imageFileSchema } from "@/lib/validators";
import { mediaUrl } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

export default function ProjectImageUploader({
  projectId,
  initialImage = null,
  onSelectCreate,
  onImageUploaded,
  onImageRemoved,
}) {
  const { toast } = useToast();
  const isEdit = Boolean(projectId);

  const inputRef = useRef(null);
  const previewRef = useRef(null);

  const [currentImage, setCurrentImage] = useState(initialImage);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const previewUrl = isEdit
    ? currentImage
      ? mediaUrl(currentImage.url)
      : null
    : pendingPreview;

  const selectFile = () => inputRef.current?.click();

  const validateAndHandle = (fileList) => {
    const file = fileList && fileList[0];
    if (!file) return;

    const result = imageFileSchema.safeParse(file);
    if (!result.success) {
      toast({
        title: "Please select a valid image file.",
        description: result.error.issues[0]?.message || "Invalid file type or size.",
        variant: "error",
      });
      setError("Please select a valid image file (JPG, PNG or WEBP, max 5MB).");
      return;
    }

    setError("");
    setSuccess(false);

    if (isEdit) {
      upload(file);
    } else {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setPendingPreview(url);
      setPendingFile(file);
      onSelectCreate?.(file);
    }
  };

  const upload = async (file) => {
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      const created = await uploadProjectImages(projectId, [file], {
        onProgress: setProgress,
      });
      const hero = created[0];
      setCurrentImage({ id: hero.id, url: hero.image_url });
      setSuccess(true);
      onImageUploaded?.(hero);
      toast({ title: "Project image uploaded successfully.", variant: "success" });
    } catch {
      toast({
        title: "Unable to upload project image. Please try again.",
        variant: "error",
      });
      setError("Unable to upload project image. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (isEdit && currentImage?.id) {
      const res = await adminDelete(`/project-images/${currentImage.id}`);
      if (res.error) {
        toast({ title: "Unable to remove image.", description: res.error, variant: "error" });
        return;
      }
      onImageRemoved?.(currentImage.id);
      setCurrentImage(null);
      setSuccess(false);
      toast({ title: "Project image removed." });
    } else {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
      setPendingFile(null);
      setPendingPreview(null);
      setSuccess(false);
      onSelectCreate?.(null);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasImage = Boolean(previewUrl);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => validateAndHandle(e.target.files)}
      />

      {!hasImage && !uploading && (
        <div
          role="button"
          tabIndex={0}
          onClick={selectFile}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectFile();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            validateAndHandle(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-accent bg-accent-faint"
              : "border-line-strong hover:border-accent"
          )}
        >
          <ImagePlus className="mb-3 h-8 w-8 text-accent-strong" />
          <p className="text-sm font-medium text-cream">
            {dragging ? "Drop image to upload" : "Drag & Drop image here"}
          </p>
          <p className="mt-1 text-xs text-cream-faint">or</p>
          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-cream transition-colors hover:border-accent-strong hover:text-accent-strong">
            <Upload className="h-4 w-4" />
            Browse Image
          </span>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
            JPG · PNG · WEBP — max 5MB
          </p>
        </div>
      )}

      {hasImage && (
        <div className="overflow-hidden rounded-lg border border-line bg-bg-muted">
          <div className="relative flex items-center justify-center bg-bg-muted p-4">
            {uploading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg-soft/90">
                <span className="font-mono text-sm text-accent-strong">{progress}%</span>
                <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-accent-strong transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-cream-faint">Uploading…</p>
              </div>
            )}
            <img
              src={previewUrl}
              alt="Selected project image preview"
              className="max-h-72 w-auto rounded-md object-contain"
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              {success ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-strong">
                  <CheckCircle2 className="h-4 w-4" />
                  {isEdit ? "Image uploaded" : "Ready to upload"}
                </span>
              ) : (
                <span className="truncate text-xs text-cream-faint">
                  {pendingFile ? pendingFile.name : currentImage?.url?.split("/").pop()}
                  {pendingFile ? ` · ${formatFileSize(pendingFile.size)}` : ""}
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={selectFile}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs text-cream transition-colors hover:border-accent-strong hover:text-accent-strong disabled:opacity-50"
              >
                <Replace className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs text-danger transition-colors hover:border-danger hover:bg-danger/10 disabled:opacity-50"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

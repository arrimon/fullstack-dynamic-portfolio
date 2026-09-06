"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { adminDelete } from "@/lib/admin";
import { uploadProjectImages } from "@/lib/uploadProjectImage";
import { mediaUrl, formatFileSize } from "@/lib/utils";
import { imageFileSchema } from "@/lib/validators";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/StateViews";

export default function ImageManager({ projectId, images: initialImages }) {
  const { toast } = useToast();
  const [images, setImages] = useState(initialImages || []);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const validateFiles = (files) => {
    const accepted = [];
    for (const file of files) {
      const result = imageFileSchema.safeParse(file);
      if (result.success) {
        accepted.push(file);
      } else {
        toast({
          title: `Rejected ${file.name}`,
          description: result.error.issues[0]?.message || "Invalid file",
          variant: "error",
        });
      }
    }
    return accepted;
  };

  const handleFiles = async (fileList) => {
    const files = validateFiles(Array.from(fileList || []));
    if (!files.length) return;

    setUploading(true);
    setError("");
    setProgress(0);
    const preview = files.map((f) => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }));
    setPending(preview);

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    try {
      const data = await uploadProjectImages(projectId, files, {
        onProgress: (p) => setProgress(p),
      });
      setImages((prev) => [...prev, ...data]);
      toast({
        title: `${data.length} image${data.length > 1 ? "s" : ""} uploaded`,
        variant: "success",
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Upload failed. Please try again.");
    } finally {
      setPending([]);
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = useCallback(
    async (image) => {
      const res = await adminDelete(`/project-images/${image.id}`);
      if (res.error) {
        toast({ title: "Delete failed", description: res.error, variant: "error" });
        return;
      }
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      toast({ title: "Image deleted" });
    },
    [toast]
  );

  return (
    <div className="rounded-xl border border-line bg-bg-soft p-6">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-accent bg-accent-faint" : "border-line-strong hover:border-accent"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <ImagePlus className="mb-3 h-8 w-8 text-accent-strong" />
        <p className="text-sm font-medium text-cream">Drop images here</p>
        <p className="mt-1 text-xs text-cream-faint">or click to browse</p>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
          JPG · PNG · WEBP — max 5MB each
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      {uploading && (
        <div className="mt-4">
          {pending.map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-lg border border-line bg-bg-soft px-3 py-2.5">
              <img src={p.url} alt="" className="h-10 w-14 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-cream">{p.name}</p>
                <p className="text-[11px] text-cream-faint">{formatFileSize(p.size)}</p>
              </div>
              <span className="font-mono text-xs text-accent-strong">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
          Gallery · {images.length} image{images.length !== 1 ? "s" : ""}
        </p>
        {images.length === 0 ? (
          <EmptyState
            icon={ImagePlus}
            title="No images yet"
            description="Upload images above. The first image becomes the project hero."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg border border-line">
                <img
                  src={mediaUrl(image.image_url)}
                  alt={image.alt_text || "Project image"}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="font-mono text-[10px] uppercase text-cream">
                    #{image.display_order}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-danger text-white transition-transform hover:scale-110"
                    aria-label="Delete image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
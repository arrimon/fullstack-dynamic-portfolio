/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";
import { publicGet } from "@/lib/api";
import { adminPut, adminPost } from "@/lib/admin";
import { mediaUrl, cn, asBool, formatFileSize } from "@/lib/utils";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import { Input, Textarea, Label, Select, Checkbox } from "@/components/ui/Form";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { imageFileSchema } from "@/lib/validators";
import { THEMES } from "@/lib/themes";

const sectionField = (key, label, placeholder) => ({
  key,
  label,
  type: "text",
  placeholder,
});

const SECTIONS = [
  {
    key: "appearance",
    label: "Appearance",
    hint: "Choose the default theme visitors see. Visitors can still pick their own and it will be remembered.",
    fields: [{ key: "theme", label: "Default theme", type: "theme" }],
  },
  {
    key: "general",
    label: "General",
    hint: "Identity and footer text used across the site.",
    fields: [
      { key: "full_name", label: "Full name", type: "text", placeholder: "Ada Lovelace" },
      { key: "role", label: "Role / headline", type: "text", placeholder: "Frontend Engineer" },
      { key: "footer_note", label: "Footer note", type: "text", placeholder: "Designed & built by Ada." },
      { key: "footer_copyright", label: "Footer copyright", type: "text", placeholder: "© {year} Ada Lovelace. All rights reserved." },
      { key: "logo", label: "Logo", type: "image", placeholder: "Upload logo" },
      { key: "profile_picture", label: "Profile picture", type: "image", placeholder: "Upload profile picture" },
    ],
  },
  {
    key: "hero",
    label: "Hero",
    hint: "The opening statement on the homepage.",
    fields: [
      { key: "hero_eyebrow", label: "Eyebrow", type: "text", placeholder: "Available for freelance" },
      { key: "hero_title", label: "Title", type: "text", placeholder: "Building digital experiences" },
      { key: "hero_subtitle", label: "Subtitle", type: "textarea", placeholder: "Short intro under the title." },
    ],
  },
  {
    key: "about",
    label: "About",
    hint: "Intro and bio shown on the homepage and About page.",
    fields: [
      { key: "about_intro", label: "Intro", type: "textarea", placeholder: "One or two sentences." },
      { key: "about_bio", label: "Bio", type: "textarea", placeholder: "Longer biography." },
      { key: "about_philosophy", label: "Philosophy", type: "textarea", placeholder: "How you approach your work." },
    ],
  },
      {
    key: "contact",
    label: "Contact",
    hint: "Public contact details.",
    fields: [
      { key: "email", label: "Email", type: "text", placeholder: "ada@example.com" },
      { key: "phone", label: "Phone", type: "text", placeholder: "+1 555 000 0000" },
      { key: "location", label: "Location", type: "text", placeholder: "Berlin, Germany" },
    ],
  },
  {
    key: "sections",
    label: "Section content",
    hint: "Editable headings, subtitles and call-to-action copy shown across the public site. Leave blank to keep the default text.",
    fields: [
      sectionField("section_projects_eyebrow", "Projects · eyebrow", "Selected Work"),
      sectionField("section_projects_title", "Projects · title", "Projects built with intent."),
      sectionField("section_projects_subtitle", "Projects · subtitle", "A selection of products and experiments."),
      sectionField("section_experience_eyebrow", "Experience · eyebrow", "Experience"),
      sectionField("section_experience_title", "Experience · title", "The path so far."),
      sectionField("section_experience_subtitle", "Experience · subtitle", "Roles and companies that shaped how I build."),
      sectionField("section_education_eyebrow", "Education · eyebrow", "Education"),
      sectionField("section_education_title", "Education · title", "Where I honed my craft."),
      sectionField("section_education_subtitle", "Education · subtitle", "Degrees, courses and continued study."),
      sectionField("section_certifications_eyebrow", "Certifications · eyebrow", "Certifications"),
      sectionField("section_certifications_title", "Certifications · title", "Continuous learning."),
      sectionField("section_technologies_eyebrow", "Technologies · label", "Technologies I work with"),
      sectionField("section_testimonials_eyebrow", "Testimonials · eyebrow", "Testimonials"),
      sectionField("section_testimonials_title", "Testimonials · title", "Kind words from clients."),
      sectionField("section_testimonials_subtitle", "Testimonials · subtitle", "What it's like to work together."),
      sectionField("section_contact_eyebrow", "Contact CTA · eyebrow", "Contact"),
      sectionField("section_contact_title", "Contact CTA · title", "Have an idea? Let's build something meaningful."),
      sectionField("section_contact_subtitle", "Contact CTA · subtitle", "Tell me what you're working on — I'd love to hear about it."),
      sectionField("section_contact_cta", "Contact CTA · button", "Start a conversation"),
    ],
  },
  {
    key: "techstack",
    label: "Tech Stack display",
    hint: "Control how the public Technologies marquee looks and behaves. These only affect the homepage Tech Stack section.",
    fields: [
      { key: "tech_stack_section_enabled", label: "Show Tech Stack section", type: "toggle", default: true },
      { key: "tech_stack_animation_enabled", label: "Enable sliding animation", type: "toggle", default: true },
      {
        key: "tech_stack_animation_direction",
        label: "Animation direction",
        type: "select",
        options: [
          ["left", "Left"],
          ["right", "Right"],
        ],
      },
      {
        key: "tech_stack_animation_speed",
        label: "Animation speed",
        type: "select",
        options: [
          ["slow", "Slow"],
          ["normal", "Normal"],
          ["fast", "Fast"],
        ],
      },
      { key: "tech_stack_pause_on_hover", label: "Pause on hover", type: "toggle", default: true },
      { key: "tech_stack_show_category", label: "Show category", type: "toggle", default: true },
      { key: "tech_stack_show_name", label: "Show technology name", type: "toggle", default: true },
    ],
  },
];

export default function SettingsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [imagePending, setImagePending] = useState([]);
  const [imageError, setImageError] = useState("");

  const load = async () => {
    const { data } = await publicGet("/api/settings");
    const map = {};
    (data || []).forEach((s) => {
      map[s.key] = s.value;
    });
    // Pre-fill new settings with safe defaults so they persist on first save.
    SECTIONS.forEach((section) =>
      section.fields.forEach((field) => {
        if (field.key in map) return;
        if (field.type === "toggle") map[field.key] = field.default ? "true" : "false";
        else if (field.type === "select") map[field.key] = field.options?.[0]?.[0] || "";
      })
    );
    setSettings(map);
  };

  useEffect(() => {
    load();
  }, []);

  if (!settings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const uploadImage = async (file, key) => {
    const result = imageFileSchema.safeParse(file);
    if (!result.success) {
      toast({
        title: "Invalid file",
        description: result.error.issues[0]?.message || "Invalid file",
        variant: "error",
      });
      return;
    }

    setUploading(true);
    setImageProgress(0);
    const preview = { name: result.data.name, size: result.data.size, url: URL.createObjectURL(result.data) };
    setImagePending([preview]);

    const formData = new FormData();
    formData.append("file", result.data);
    formData.append("key", key);

    try {
      const { data, error } = await adminPost("/settings/upload-image", formData);
      if (error) throw new Error(error);
      setImagePending([]);
      setSettings((prev) => ({ ...prev, [key]: data.url }));
      toast({
        title: `${preview.name} uploaded`,
        variant: "success",
      });
    } catch (err) {
      const detail = err.message || err.response?.data?.detail;
      setImageError(
        typeof detail === "string" ? detail : "Upload failed. Please try again."
      );
      toast({
        title: "Upload failed",
        description: typeof detail === "string" ? detail : "Upload failed. Please try again.",
        variant: "error",
      });
    } finally {
      setUploading(false);
      setImageProgress(0);
      if (preview) URL.revokeObjectURL(preview.url);
    }
  };

  const save = async () => {
    setSaving(true);
    const res = await adminPut("/settings", { settings });
    setSaving(false);
    if (res.error) {
      toast({ title: "Save failed", description: res.error, variant: "error" });
      return;
    }
    toast({ title: "Settings saved", variant: "success" });
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Site-wide text and contact details. Every field is optional — blank fields are hidden."
        actions={
          <Button size="sm" onClick={save} disabled={saving} arrow>
            {saving ? (
              <>
                <Spinner className="h-4 w-4" />
                Saving…
              </>
            ) : (
              "Save settings"
            )}
          </Button>
        }
      />

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.key} className="rounded-xl border border-line bg-bg-soft p-6">
            <div className="mb-1 flex items-center gap-3">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-cream">
                {section.label}
              </h2>
            </div>
            <p className="mb-5 text-sm text-cream-faint">{section.hint}</p>
            <div className="space-y-5">
              {section.fields.map((field) => {
                if (field.type === "theme") {
                  const current = settings[field.key] || "";
                  return (
                    <div key={field.key}>
                      <Label>{field.label}</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                        {THEMES.map((theme) => {
                          const active = current === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => set(field.key, theme.id)}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                                active
                                  ? "border-accent bg-accent-faint text-cream"
                                  : "border-line text-cream-muted hover:border-line-strong"
                              )}
                              aria-pressed={active}
                            >
                              <span className="flex h-5 w-7 shrink-0 items-center justify-center gap-1 rounded border border-line-strong">
                                {theme.swatches.map((c, i) => (
                                  <span
                                    key={i}
                                    className="h-2.5 w-1 rounded-full"
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </span>
                              <span className="truncate font-medium">{theme.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                if (field.type === "image") {
                return (
                  <div key={field.key} className="flex items-center gap-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    {settings[field.key] && (
                      <a
                        href={mediaUrl(settings[field.key])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:inline-block text-sm text-cream-faint underline"
                      >
                        View
                      </a>
                    )}
                    <input
                      id={field.key}
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      type="file"
                      className="sr-only"
                      onChange={(e) => uploadImage(e.target.files?.[0], field.key)}
                    />
                  </div>
                );
              }
              if (field.type === "toggle") {
                const checked = asBool(settings[field.key], field.default);
                return (
                  <label
                    key={field.key}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-line bg-bg-muted px-4 py-3"
                  >
                    <span className="text-sm text-cream">{field.label}</span>
                    <Checkbox
                      checked={checked}
                      onChange={(e) => set(field.key, e.target.checked ? "true" : "false")}
                    />
                  </label>
                );
              }
              if (field.type === "select") {
                return (
                  <div key={field.key}>
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Select
                      id={field.key}
                      value={settings[field.key] || field.options[0][0]}
                      onChange={(e) => set(field.key, e.target.value)}
                    >
                      {field.options.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </div>
                );
                }
                return (
                  <div key={field.key}>
                    <Label htmlFor={field.key}>{field.label}</Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        rows={field.key === "about_bio" ? 6 : 3}
                        placeholder={field.placeholder}
                        value={settings[field.key] || ""}
                        onChange={(e) => set(field.key, e.target.value)}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        placeholder={field.placeholder}
                        value={settings[field.key] || ""}
                        onChange={(e) => set(field.key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {imageError && (
        <p role="alert" className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {imageError}
        </p>
      )}

      {uploading && (
        <div className="mt-4">
          {imagePending.map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-lg border border-line bg-bg-soft px-3 py-2.5">
              <img src={p.url} alt="" className="h-10 w-14 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-cream">{p.name}</p>
                <p className="text-[11px] text-cream-faint">{formatFileSize(p.size)}</p>
              </div>
              <span className="font-mono text-xs text-accent-strong">{imageProgress}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Spinner className="h-4 w-4" />
              Saving…
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </div>
    </div>
  );
}
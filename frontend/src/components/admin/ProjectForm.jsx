"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2, Save } from "lucide-react";
import { projectSchema } from "@/lib/validators";
import { adminGet, adminPost, adminPut } from "@/lib/admin";
import { slugify } from "@/lib/utils";
import { uploadProjectImages } from "@/lib/uploadProjectImage";
import { Label, Input, Textarea, Select, Checkbox, FieldError } from "@/components/ui/Form";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProjectImageUploader from "@/components/admin/ProjectImageUploader";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";

function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border border-line bg-bg-soft p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold tracking-tight text-cream">{title}</h2>
        {description && <p className="mt-1 text-xs text-cream-faint">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export default function ProjectForm({ project, technologies, onImageUploaded, onImageRemoved }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!project;
  const [availableTech, setAvailableTech] = useState(technologies || null);
  const [pendingImage, setPendingImage] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          short_description: project.short_description,
          description: project.description,
          thumbnail_url: project.thumbnail_url || "",
          github_link: project.github_link || "",
          live_link: project.live_link || "",
          testing_email: project.testing_email || "",
          testing_password: project.testing_password || "",
          status: project.status,
          is_featured: project.is_featured,
          display_order: project.display_order,
          meta_title: project.meta_title || "",
          meta_description: project.meta_description || "",
          technology_ids: (project.technologies || []).map((t) => t.id),
        }
      : {
          title: "",
          short_description: "",
          description: "",
          thumbnail_url: "",
          github_link: "",
          live_link: "",
          testing_email: "",
          testing_password: "",
          status: "draft",
          is_featured: false,
          display_order: 0,
          meta_title: "",
          meta_description: "",
          technology_ids: [],
        },
  });

  useEffect(() => {
    if (availableTech) return;
    adminGet("/technologies").then((res) => {
      if (!res.error) setAvailableTech(res.data);
    });
  }, [availableTech]);

  const title = watch("title");
  const slugPreview = useMemo(() => (title ? slugify(title) : "project-slug"), [title]);
  const selectedTech = watch("technology_ids") || [];

  const toggleTech = (id) => {
    const current = selectedTech || [];
    if (current.includes(id)) {
      setValue("technology_ids", current.filter((t) => t !== id));
    } else {
      setValue("technology_ids", [...current, id]);
    }
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      github_link: values.github_link || null,
      live_link: values.live_link || null,
      testing_email: values.testing_email || null,
      testing_password: values.testing_password || null,
      thumbnail_url: values.thumbnail_url || null,
      meta_title: values.meta_title || null,
      meta_description: values.meta_description || null,
      technology_ids: selectedTech,
    };

    const res = isEditing
      ? await adminPut(`/projects/${project.id}`, payload)
      : await adminPost("/projects", payload);

    if (res.error) {
      toast({ title: "Save failed", description: res.error, variant: "error" });
      return;
    }

    if (!isEditing && pendingImage) {
      try {
        const created = await uploadProjectImages(res.data.id, [pendingImage]);
        onImageUploaded?.(created[0]);
        toast({ title: "Project image uploaded successfully.", variant: "success" });
      } catch {
        toast({
          title: "Project created, but the image upload failed.",
          description: "You can upload it from the Images tab.",
          variant: "error",
        });
      }
    }

    toast({
      title: isEditing ? "Project updated" : "Project created",
      variant: "success",
    });
    router.push(`/admin/projects/${res.data.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" href="/admin/projects">
          <ArrowLeft className="h-3.5 w-3.5" />
          All projects
        </Button>
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? "Save changes" : "Create project"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Section
        title="Basic information"
        description="Title, slug and the core description of the project."
      >
        <div>
          <Label htmlFor="title" required>
            Title
          </Label>
          <Input id="title" placeholder="A remarkable project" {...register("title")} />
          <FieldError>{errors.title?.message}</FieldError>
          <p className="mt-1.5 font-mono text-xs text-cream-faint">
            Slug preview: <span className="text-accent-strong">/{slugPreview}</span>
          </p>
        </div>
        <div>
          <Label htmlFor="short_description" required>
            Short description
          </Label>
          <Textarea
            id="short_description"
            rows={3}
            placeholder="One or two sentences used on cards and listings."
            {...register("short_description")}
          />
          <FieldError>{errors.short_description?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="description" required>
            Description
          </Label>
          <Textarea
            id="description"
            rows={8}
            placeholder="The full story — overview, challenges, approach, outcome. Blank lines become paragraphs."
            {...register("description")}
          />
          <FieldError>{errors.description?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
          <Input
            id="thumbnail_url"
            placeholder="https://… or /uploads/…"
            {...register("thumbnail_url")}
          />
          <FieldError>{errors.thumbnail_url?.message}</FieldError>
        </div>
      </Section>

      <Section
        title="Project Image"
        description="Upload a project image directly. The first image is used on the project page."
      >
        <ProjectImageUploader
          projectId={isEditing ? project.id : undefined}
          initialImage={
            isEditing && project.images?.length
              ? { id: project.images[0].id, url: project.images[0].image_url }
              : null
          }
          onSelectCreate={setPendingImage}
          onImageUploaded={onImageUploaded}
          onImageRemoved={onImageRemoved}
        />
      </Section>

      <Section title="Links" description="Source code and live demo destinations.">
        <div>
          <Label htmlFor="github_link">GitHub repository</Label>
          <Input id="github_link" placeholder="https://github.com/…" {...register("github_link")} />
          <FieldError>{errors.github_link?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="live_link">Live demo</Label>
          <Input id="live_link" placeholder="https://…" {...register("live_link")} />
          <FieldError>{errors.live_link?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="testing_email">Testing email</Label>
          <Input id="testing_email" type="email" placeholder="test@viewer.com" {...register("testing_email")} />
          <FieldError>{errors.testing_email?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="testing_password">Testing password</Label>
          <Input id="testing_password" type="text" placeholder="Test@@123" {...register("testing_password")} />
          <FieldError>{errors.testing_password?.message}</FieldError>
        </div>
      </Section>

      <Section title="Publishing" description="Visibility, ordering and promotion.">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="status" required>
              Status
            </Label>
            <Select id="status" {...register("status")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="display_order">Display order</Label>
            <Input
              id="display_order"
              type="number"
              step="1"
              {...register("display_order")}
            />
            <FieldError>{errors.display_order?.message}</FieldError>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox {...register("is_featured")} />
          <span className="text-sm text-cream">
            Feature this project
            <span className="ml-1 text-cream-faint">— highlighted on the homepage.</span>
          </span>
        </label>
      </Section>

      <Section title="SEO" description="Meta title and description for search engines.">
        <div>
          <Label htmlFor="meta_title">Meta title</Label>
          <Input id="meta_title" placeholder="Defaults to the project title" {...register("meta_title")} />
          <FieldError>{errors.meta_title?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="meta_description">Meta description</Label>
          <Textarea id="meta_description" rows={2} placeholder="Defaults to the short description" {...register("meta_description")} />
          <FieldError>{errors.meta_description?.message}</FieldError>
        </div>
      </Section>

      <Section
        title="Technologies"
        description="The stack used in this project."
      >
        {!availableTech ? (
          <div className="flex items-center gap-2 text-sm text-cream-faint">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading technologies…
          </div>
        ) : availableTech.length === 0 ? (
          <p className="text-sm text-cream-faint">
            No technologies defined yet. Add them under{" "}
            <a href="/admin/technologies" className="text-accent-strong underline">
              Technologies
            </a>
            .
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableTech.map((tech) => {
              const selected = selectedTech.includes(tech.id);
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => toggleTech(tech.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    selected
                      ? "border-accent bg-accent-faint text-cream"
                      : "border-line text-cream-muted hover:border-line-strong"
                  }`}
                  aria-pressed={selected}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-accent-strong" />}
                  {tech.name}
                  <span className="font-mono text-[10px] uppercase text-cream-faint">
                    {tech.category}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="h-4 w-4" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditing ? "Save changes" : "Create project"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
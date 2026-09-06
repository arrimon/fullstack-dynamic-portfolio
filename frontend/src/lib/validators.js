import { z } from "zod";

const optionalUrl = z
  .union([z.literal(""), z.string().max(500)])
  .optional()
  .transform((v) => (v ? v : null));

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z.string().email("Enter a valid email address").max(255),
  subject: z.string().max(255, "Subject is too long").optional().or(z.literal("")),
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message is too long (max 5000 characters)"),
  website: z.string().max(255).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(255),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  short_description: z.string().min(1, "A short description is required").max(500),
  description: z.string().min(1, "A description is required"),
  thumbnail_url: optionalUrl,
  github_link: optionalUrl,
  live_link: optionalUrl,
  testing_email: z.string().email().optional().or(z.literal("")),
  testing_password: z.string().max(255).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  is_featured: z.boolean(),
  display_order: z.coerce.number().int().default(0),
  meta_title: z.string().max(255).optional().or(z.literal("")),
  meta_description: z.string().max(500).optional().or(z.literal("")),
  technology_ids: z.array(z.number()).default([]),
});

export const experienceSchema = z.object({
  company_name: z.string().min(1, "Company is required").max(255),
  position: z.string().min(1, "Position is required").max(255),
  employment_type: z.enum(["full-time", "part-time", "freelance", "internship"]),
  location: z.string().max(255).optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  is_current: z.boolean(),
  display_order: z.coerce.number().int().default(0),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required").max(255),
  degree: z.string().min(1, "Degree is required").max(255),
  field_of_study: z.string().max(255).optional().or(z.literal("")),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
  grade: z.string().max(100).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  display_order: z.coerce.number().int().default(0),
});

export const certificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  issuing_organization: z.string().min(1, "Organization is required").max(255),
  issue_date: z.string().min(1, "Issue date is required"),
  credential_url: optionalUrl,
  image_url: optionalUrl,
});

export const technologySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.enum(["frontend", "backend", "database", "tools"]),
  icon_url: optionalUrl,
  is_active: z.boolean().default(true),
});

export const testimonialSchema = z.object({
  client_name: z.string().min(1, "Client name is required").max(255),
  client_role: z.string().max(255).optional().or(z.literal("")),
  company_name: z.string().max(255).optional().or(z.literal("")),
  client_image: optionalUrl,
  review_text: z.string().min(1, "A review is required"),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  is_active: z.boolean().default(true),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required").max(100),
  url: z.string().url("Enter a valid URL").max(500),
  icon: z.string().max(255).optional().or(z.literal("")),
});

export const resumeSchema = z.object({
  file: z
    .any()
    .refine((file) => file, "Select a PDF file")
    .refine(
      (file) => file && (file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf")),
      "Resume must be a PDF"
    )
    .refine((file) => file && file.size <= 5 * 1024 * 1024, "Resume must be under 5MB"),
  version_label: z.string().max(255).optional().or(z.literal("")),
});

export const imageFileSchema = z
  .any()
  .refine((file) => file, "Select an image")
  .refine(
    (file) =>
      file &&
      ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
      /\.(jpe?g|png|webp)$/i.test(file.name || ""),
    "Only JPG, PNG or WEBP images are allowed"
  )
  .refine((file) => file && file.size <= 5 * 1024 * 1024, "Images must be under 5MB");
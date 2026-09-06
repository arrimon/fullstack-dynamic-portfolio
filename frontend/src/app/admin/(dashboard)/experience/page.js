"use client";

import CrudManager from "@/components/admin/CrudManager";
import Badge from "@/components/ui/Badge";
import { experienceSchema } from "@/lib/validators";
import { formatMonthYear } from "@/lib/utils";

const fields = [
  { name: "position", label: "Position", type: "text", required: true },
  { name: "company_name", label: "Company", type: "text", required: true },
  {
    name: "employment_type",
    label: "Employment type",
    type: "select",
    required: true,
    options: [
      { value: "full-time", label: "Full-time" },
      { value: "part-time", label: "Part-time" },
      { value: "freelance", label: "Freelance" },
      { value: "internship", label: "Internship" },
    ],
  },
  { name: "location", label: "Location", type: "text", optional: true },
  { name: "description", label: "Description", type: "textarea", required: true, rows: 5 },
  { name: "start_date", label: "Start date", type: "date", required: true },
  { name: "end_date", label: "End date", type: "date", optional: true, conditional: "is_current" },
  { name: "is_current", label: "I currently work here", type: "checkbox" },
  { name: "display_order", label: "Display order", type: "number" },
];

export default function AdminExperiencePage() {
  return (
    <CrudManager
      title="Experience"
      description="Your professional history, shown on the homepage and About page."
      path="/experience"
      fields={fields}
      schema={experienceSchema}
      newLabel="Add experience"
      columns={[
        { key: "position", render: (e) => e.position },
        { key: "company_name", render: (e) => <span className="text-accent-strong">{e.company_name}</span> },
        {
          key: "dates",
          render: (e) => (
            <span className="font-mono text-xs uppercase tracking-widest text-cream-faint">
              {formatMonthYear(e.start_date)} — {e.is_current ? "Present" : formatMonthYear(e.end_date)}
            </span>
          ),
        },
        {
          key: "current",
          render: (e) => (e.is_current ? <Badge tone="accent">Current</Badge> : null),
        },
      ]}
    />
  );
}
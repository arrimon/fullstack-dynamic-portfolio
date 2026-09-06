"use client";

import CrudManager from "@/components/admin/CrudManager";
import { educationSchema } from "@/lib/validators";
import { formatMonthYear } from "@/lib/utils";

const fields = [
  { name: "degree", label: "Degree", type: "text", required: true },
  { name: "institution", label: "Institution", type: "text", required: true },
  { name: "field_of_study", label: "Field of study", type: "text", optional: true },
  { name: "start_date", label: "Start date", type: "date", required: true },
  { name: "end_date", label: "End date", type: "date", optional: true },
  { name: "grade", label: "Grade", type: "text", optional: true },
  { name: "description", label: "Description", type: "textarea", optional: true, rows: 3 },
  { name: "display_order", label: "Display order", type: "number" },
];

export default function AdminEducationPage() {
  return (
    <CrudManager
      title="Education"
      description="Your academic background, shown on the About page."
      path="/education"
      fields={fields}
      schema={educationSchema}
      newLabel="Add education"
      columns={[
        { key: "degree", render: (e) => e.degree },
        { key: "institution", render: (e) => <span className="text-accent-strong">{e.institution}</span> },
        {
          key: "dates",
          render: (e) => (
            <span className="font-mono text-xs uppercase tracking-widest text-cream-faint">
              {formatMonthYear(e.start_date)} — {e.end_date ? formatMonthYear(e.end_date) : "Present"}
            </span>
          ),
        },
      ]}
    />
  );
}
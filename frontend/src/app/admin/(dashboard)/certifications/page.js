"use client";

import CrudManager from "@/components/admin/CrudManager";
import { certificationSchema } from "@/lib/validators";
import { formatMonthYear } from "@/lib/utils";

const fields = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "issuing_organization", label: "Issuing organization", type: "text", required: true },
  { name: "issue_date", label: "Issue date", type: "date", required: true },
  { name: "credential_url", label: "Credential URL", type: "url", optional: true },
  { name: "image_url", label: "Image URL", type: "url", optional: true },
];

export default function AdminCertificationsPage() {
  return (
    <CrudManager
      title="Certifications"
      description="Certificates and credentials shown on the homepage and About page."
      path="/certifications"
      fields={fields}
      schema={certificationSchema}
      newLabel="Add certification"
      columns={[
        { key: "title", render: (e) => e.title },
        { key: "organization", render: (e) => <span className="text-accent-strong">{e.issuing_organization}</span> },
        {
          key: "date",
          render: (e) => (
            <span className="font-mono text-xs uppercase tracking-widest text-cream-faint">
              {formatMonthYear(e.issue_date)}
            </span>
          ),
        },
      ]}
    />
  );
}
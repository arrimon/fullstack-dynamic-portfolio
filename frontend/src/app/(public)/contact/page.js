import { Mail, MapPin, Phone } from "lucide-react";
import { getSettings, toSettingsObject } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Have an idea or a project in mind? Let's build something meaningful together.",
};

export default async function ContactPage() {
  const { data: settingsRes } = await getSettings();
  const site = toSettingsObject(settingsRes);

  const contactItems = [
    site.email && { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.phone && { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone}` },
    site.location && { icon: MapPin, label: "Location", value: site.location },
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-32 sm:px-8 md:pt-40">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-cream-faint">
                Contact
              </span>
            </div>
            <h1 className="mt-6 text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.03] tracking-tight text-cream">
              Let’s work together.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-cream-muted">
              Have an idea, a project or just want to say hi? Tell me about it — I’d
              love to hear from you.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 space-y-4">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center gap-4 rounded-xl border border-line bg-bg-soft px-5 py-4 transition-colors hover:border-line-strong">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent-faint text-accent-strong">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-cream-faint">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-cream">{item.value}</p>
                    </div>
                  </div>
                );
                return item.href ? (
                  <a key={item.label} href={item.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                );
              })}
            </div>
          </Reveal>

        </div>

        <Reveal delay={0.12}>
          <div className="rounded-2xl border border-line bg-bg-soft p-6 sm:p-8">
            <h2 className="mb-6 font-semibold tracking-tight text-cream">
              Send a message
            </h2>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
import Hero from "@/components/sections/Hero";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import TechMarquee from "@/components/sections/TechMarquee";
import AboutSnapshot from "@/components/sections/AboutSnapshot";
import ExperiencePreview from "@/components/sections/ExperiencePreview";
import CertificationsList from "@/components/sections/CertificationsList";
import Testimonials from "@/components/sections/Testimonials";
import CTABanner from "@/components/sections/CTABanner";
import Button from "@/components/ui/Button";
import {
  getSettings,
  getSocialLinks,
  getProjects,
  getProjectBySlug,
  getExperience,
  getCertifications,
  getResume,
  getTestimonials,
  getTechnologies,
  toSettingsObject,
} from "@/lib/data";
import { mediaUrl } from "@/lib/utils";

export default async function HomePage() {
  const [
    settingsRes,
    socialRes,
    projectsRes,
    experienceRes,
    certsRes,
    resumeRes,
    testimonialsRes,
    technologiesRes,
  ] = await Promise.all([
    getSettings(),
    getSocialLinks(),
    getProjects({ featured: true, page_size: 4 }),
    getExperience(),
    getCertifications(),
    getResume(),
    getTestimonials(),
    getTechnologies(),
  ]);

  const site = toSettingsObject(settingsRes.data);
  const socialLinks = socialRes.data || [];

  const listItems = projectsRes.data?.items || [];
  const fallbackRes = listItems.length ? null : await getProjects({ page_size: 4 });
  const projectItems = listItems.length ? listItems : (fallbackRes?.data?.items || []);

  const details = await Promise.all(
    projectItems.slice(0, 4).map((p) => getProjectBySlug(p.slug))
  );
  const projectDetails = details.map((d) => d.data).filter(Boolean);

  // Public Tech Stack is driven solely by the dedicated, admin-managed list of
  // active technologies. Toggling a technology off in the admin (or toggling
  // all off) must hide it here, so we do NOT fall back to the technologies
  // referenced by projects (project details can include inactive ones).
  const technologies = technologiesRes.data || [];

  const experience = experienceRes.data || [];
  const certifications = certsRes.data || [];
  const resume = resumeRes.data;
  const testimonials = testimonialsRes.data || [];

  const sectionHeading = (prefix) => ({
    eyebrow: site[`section_${prefix}_eyebrow`],
    title: site[`section_${prefix}_title`],
    description: site[`section_${prefix}_subtitle`],
  });

  return (
    <>
      <Hero site={site} socialLinks={socialLinks} />
      <FeaturedProjects projects={projectDetails} site={site} />
      <TechMarquee
        technologies={technologies}
        settings={site}
        label={site.section_technologies_eyebrow || "Technologies I work with"}
      />
      <AboutSnapshot site={site} />

      <ExperiencePreview experience={experience} heading={sectionHeading("experience")} />

      {resume ? (
        <CTABanner
          eyebrow="Resume"
          title="Want the full picture?"
          description="Download a concise overview of my experience, skills and education."
          action={
            <Button href={mediaUrl(resume.file_url)} size="lg" arrow target="_blank" rel="noopener noreferrer">
              Download resume
            </Button>
          }
          secondaryAction={
            <Button href="/resume" size="lg" variant="secondary">
              View resume
            </Button>
          }
          className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32"
        />
      ) : null}

      <CertificationsList certifications={certifications} limit={4} heading={sectionHeading("certifications")} />

      <Testimonials testimonials={testimonials} heading={sectionHeading("testimonials")} />

      <CTABanner
        eyebrow={site.section_contact_eyebrow || "Contact"}
        title={site.section_contact_title || "Have an idea? Let's build something meaningful."}
        description={
          site.section_contact_subtitle ||
          (site.email
            ? `Reach me at ${site.email} or send a message — I usually reply within a day.`
            : "Tell me what you're working on — I'd love to hear about it.")
        }
        action={
          <Button href="/contact" size="lg" arrow>
            {site.section_contact_cta || "Start a conversation"}
          </Button>
        }
        secondaryAction={
          site.email ? (
            <Button href={`mailto:${site.email}`} size="lg" variant="secondary">
              Email me
            </Button>
          ) : null
        }
        className="mx-auto max-w-6xl px-5 pt-24 pb-28 sm:px-8 md:pt-32 md:pb-36"
      />
    </>
  );
}
import { getSettings, getSocialLinks, toSettingsObject } from "@/lib/data";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { DEFAULT_THEME, isThemeId } from "@/lib/themes";

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #2b0a54 0%, #1c0736 34%, #12051f 62%, #3d0f45 100%)",
        }}
      />
      <div
        className="absolute -top-32 left-[8%] h-[420px] w-[520px] animate-glow-drift rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(147,51,234,0.5), transparent)" }}
      />
      <div
        className="absolute right-[4%] top-[28%] h-[380px] w-[460px] animate-glow-drift rounded-full blur-3xl"
        style={{
          background: "radial-gradient(closest-side, rgba(224,51,159,0.38), transparent)",
          animationDelay: "-6s",
        }}
      />
      <div
        className="absolute bottom-[6%] left-[30%] h-[340px] w-[560px] animate-glow-drift rounded-full blur-3xl"
        style={{
          background: "radial-gradient(closest-side, rgba(88,28,135,0.55), transparent)",
          animationDelay: "-11s",
        }}
      />
    </div>
  );
}

export default async function PublicLayout({ children }) {
  const [settingsResult, socialResult] = await Promise.all([
    getSettings(),
    getSocialLinks(),
  ]);
  const site = toSettingsObject(settingsResult.data);
  const socialLinks = socialResult.data || [];
  const defaultTheme = isThemeId(site.theme) ? site.theme : DEFAULT_THEME;

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <div className="flex min-h-dvh flex-col">
        <AmbientBackground />
        <Navbar site={site} socialLinks={socialLinks} />
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer site={site} socialLinks={socialLinks} />
      </div>
    </ThemeProvider>
  );
}

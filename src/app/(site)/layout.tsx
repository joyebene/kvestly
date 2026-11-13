import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PrelaunchBar } from "@/components/layout/PrelaunchBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrelaunchBar />
      <Navbar />
      <main id="main" className="-mt-[72px]">{children}</main>
      <Footer />
    </>
  );
}

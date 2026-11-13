import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { risk } from "@/content/legal";
export const metadata: Metadata = { title: "Risk Disclosure" };
export default function Page() { return <LegalPage doc={risk} draft={false} />; }

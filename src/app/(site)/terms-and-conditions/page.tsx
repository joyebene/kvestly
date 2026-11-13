import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { terms } from "@/content/legal";
export const metadata: Metadata = { title: "Terms and Conditions" };
export default function Page() { return <LegalPage doc={terms} />; }

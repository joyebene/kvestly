import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/AuthForms";
export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export default function Page() {
  return (<><h1 className="mt-10 text-3xl font-semibold">Sign in</h1><p className="mb-8 mt-2 text-sm text-silver-500">Access your KVESTY account.</p><LoginForm /></>);
}

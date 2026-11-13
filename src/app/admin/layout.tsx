import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { LayoutDashboard, Users, BadgeCheck, Package, ArrowLeftRight, Inbox, MessageSquare, FileText, ScrollText, KeyRound, ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getAuth } from "@/lib/session";
import { can, isStaff, type Permission } from "@/lib/rbac";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | KVESTY Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const all: { href: string; label: string; icon: string; perm?: Permission }[] = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/admin/users", label: "Users", icon: "Users", perm: "users:read" },
  { href: "/admin/verification", label: "Identity review", icon: "BadgeCheck", perm: "kyc:review" },
  { href: "/admin/products", label: "Investment products", icon: "Package", perm: "products:manage" },
  { href: "/admin/transactions", label: "Transactions", icon: "ArrowLeftRight", perm: "transactions:read" },
  { href: "/admin/requests", label: "Deposit & withdrawal", icon: "Inbox", perm: "requests:read" },
  { href: "/admin/communications", label: "Client communication", icon: "MessageSquare", perm: "support:manage" },
  { href: "/admin/content", label: "Content", icon: "FileText", perm: "content:manage" },
  { href: "/admin/audit-logs", label: "Audit logs", icon: "ScrollText", perm: "audit:read" },
  { href: "/admin/roles", label: "Roles & permissions", icon: "KeyRound", perm: "users:read" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await getAuth();
  if (!u) redirect("/login");
  if (!isStaff(u.role)) notFound(); // admin area is not discoverable to clients
  if (!(u.mfaEnabled && u.mfaVerified)) redirect("/dashboard/security?mfa=required");
  const items = [...all.filter((i) => !i.perm || can(u.role, i.perm)), { href: "/dashboard", label: "Client view", icon: "ArrowLeft" }];
  return (
    <div className="min-h-dvh lg:flex">
      <Sidebar items={items} name={u.fullName} sub={`${u.role} · ${u.email}`} area="Admin" />
      <main id="main" className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-6xl">{children}</div></main>
    </div>
  );
}
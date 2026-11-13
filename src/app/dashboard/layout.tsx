import type { Metadata } from "next";
import { LayoutDashboard, UserRound, BadgeCheck, PieChart, History, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Bell, LifeBuoy, ShieldCheck } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getAuth } from "@/lib/session";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/rbac";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s | KVESTY" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const items = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/profile", label: "Account profile", icon: "UserRound" },
  { href: "/dashboard/deposits", label: "Invest", icon: "BadgeCheck" },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: "PieChart" },
  { href: "/dashboard/history", label: "Investment history", icon: "History" },
  { href: "/dashboard/transactions", label: "Transactions", icon: "ArrowLeftRight" },
  { href: "/dashboard/withdrawals", label: "Withdrawal requests", icon: "ArrowUpFromLine" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "Bell" },
  { href: "/dashboard/support", label: "Support", icon: "LifeBuoy" },
  { href: "/dashboard/security", label: "Security", icon: "ShieldCheck" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const u = await getAuth(); // security page must stay reachable for staff who still need to enrol MFA
  if (!u) redirect("/login");
  const nav = isStaff(u.role) ? [{ href: "/admin", label: "Admin console", icon: "ShieldCheck" }, ...items] : items;
  return (
    <div className="min-h-dvh lg:flex">
      <Sidebar items={nav} name={u.fullName} sub={u.email} area="Client" />
      <main id="main" className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-6xl">{children}</div></main>
    </div>
  );
}
import type { Role } from "../models/User";

/**
 * Permission matrix. Every admin route handler must call requirePermission().
 * Principle of least privilege: roles only get what their job requires.
 */
export const PERMISSIONS = {
  "users.read": ["support", "compliance", "finance", "admin", "superadmin"],
  "users.suspend": ["admin", "superadmin"],
  "users.role.change": ["superadmin"],
  "kyc.read": ["compliance", "admin", "superadmin"],
  "kyc.review": ["compliance", "superadmin"],
  "products.read": ["compliance", "finance", "admin", "superadmin"],
  "products.write": ["admin", "superadmin"],
  "products.approve.compliance": ["compliance", "superadmin"],
  "products.approve.legal": ["admin", "superadmin"],
  "products.publish": ["admin", "superadmin"],
  "transactions.read": ["finance", "compliance", "admin", "superadmin"],
  "requests.read": ["finance", "admin", "superadmin"],
  "requests.review": ["finance", "superadmin"],
  "messages.read": ["support", "admin", "superadmin"],
  "messages.reply": ["support", "admin", "superadmin"],
  "content.write": ["admin", "superadmin"],
  "notifications.send": ["support", "admin", "superadmin"],
  "audit.read": ["compliance", "admin", "superadmin"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export const ADMIN_ROLES: readonly Role[] = ["support", "compliance", "finance", "admin", "superadmin"];

export const isStaff = (role: Role) => ADMIN_ROLES.includes(role);

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

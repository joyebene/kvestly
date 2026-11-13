/** Role-based access control. Every staff capability is an explicit permission string. */
export const ROLES = ["client", "support", "compliance", "finance", "admin", "superadmin"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "users:read",
  "users:manage",
  "roles:manage",

  "products:manage",
  "products:publish",
  "transactions:read",
  "requests:read",
  "requests:review",
  "support:manage",
  "messages:read",
  "notifications:send",
  "content:manage",
  "audit:read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const map: Record<Role, readonly Permission[]> = {
  client: [],
  support: ["users:read", "support:manage", "messages:read", "notifications:send"],
  compliance: ["users:read", "products:manage", "products:publish", "requests:read", "transactions:read", "audit:read"],
  finance: ["users:read", "transactions:read", "requests:read", "requests:review"],
  admin: [
    "users:read", "users:manage", "products:manage", "transactions:read", "requests:read",
    "support:manage", "messages:read", "notifications:send", "content:manage", "audit:read",
  ],
  superadmin: PERMISSIONS,
};

export const isStaff = (r: Role) => r !== "client";
export const can = (role: Role, p: Permission) => map[role].includes(p);
export const permissionsFor = (role: Role) => map[role];

/** Sessions of staff roles are shorter and require MFA. */
export const sessionPolicy = (role: Role) =>
  isStaff(role)
    ? { absoluteMs: 8 * 3600_000, idleMs: 30 * 60_000, requireMfa: true }
    : { absoluteMs: 7 * 24 * 3600_000, idleMs: 24 * 3600_000, requireMfa: false };
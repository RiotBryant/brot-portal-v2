export type RoleName = "new" | "member" | "admin" | "superadmin" | "god";

const rank: Record<RoleName, number> = {
  new: 0,
  member: 1,
  admin: 2,
  superadmin: 3,
  god: 4,
};

export function hasMinRole(userRole: RoleName, minRole: RoleName) {
  return rank[userRole] >= rank[minRole];
}

/** Where a signed-in user lands after the splash. Student (or admin) wins over parent/teacher. */
export function landingFor(roles: string[]): "home" | "parent" | "teacher" | "waiting" {
  if (roles.includes("student") || roles.includes("admin")) return "home";
  if (roles.includes("parent")) return "parent";
  if (roles.includes("instructor")) return "teacher";
  return "waiting";
}

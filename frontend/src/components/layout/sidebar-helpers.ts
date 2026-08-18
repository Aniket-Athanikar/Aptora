import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function navigate(router: AppRouterInstance, tab: string, sub?: string) {
  if (tab === "home") return router.push("/");
  if (tab === "dashboard") return router.push("/dashboard");
  if (tab === "ai") return router.push("/dashboard/ai");
  if (tab === "ai-sources" || tab === "sources" || tab === "knowledge") return router.push("/ai-study/sources");
  if (tab === "downloads") return router.push("/dashboard/downloads");
  if (tab === "ai-notes") return router.push("/dashboard/ai-notes");
  if (tab === "progress") return router.push("/dashboard/progress");
  if (tab === "analytics") return router.push("/dashboard/analytics");
  if (tab === "achievements") return router.push("/dashboard/achievements");
  if (tab === "coach") return router.push("/dashboard/coach");
  if (tab === "notifications") return router.push("/dashboard/notifications");

  if (tab === "knowledge" && sub) {
    return router.push(`/dashboard?tab=knowledge&sub=${sub}`);
  }
  return router.push(`/dashboard?tab=${tab}`);
}

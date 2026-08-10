"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardAISourcesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ai-study/sources");
  }, [router]);

  return null;
}

"use client";

import { useCallback, useEffect, useState } from "react";
import type { GrantsApiMeta, GrantsApiResponse } from "@/lib/api/utils";
import type { GrantProgram } from "@/types";

export function useGrants() {
  const [grants, setGrants] = useState<GrantProgram[]>([]);
  const [meta, setMeta] = useState<GrantsApiMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/grants", { cache: "no-store" });
      const data = (await res.json()) as GrantsApiResponse & { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "공고를 불러오지 못했습니다.");
      }

      setGrants(data.grants);
      setMeta(data.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "공고 조회 실패");
      setGrants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { grants, meta, loading, error, reload: load };
}

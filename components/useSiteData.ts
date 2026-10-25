"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { SiteData } from "@/lib/types";

/** Ambil semua konten publik (konten, toko, menu, testimoni, FAQ) sekali saat halaman dibuka. */
export function useSiteData() {
  const [data, setData] = useState<SiteData | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api<SiteData>("/api/site-content"));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, error, reload: load };
}

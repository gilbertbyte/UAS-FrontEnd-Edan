"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { useAuth } from "./AuthProvider";

type Ids = { menu: Set<number>; store: Set<number> };

export function useWishlist() {
  const { user, openAuth } = useAuth();
  const [ids, setIds] = useState<Ids>({ menu: new Set(), store: new Set() });

  const load = useCallback(async () => {
    try {
      const rows = await api<{ item_type: "menu" | "store"; item_id: number }[]>("/api/wishlist/ids");
      const next: Ids = { menu: new Set(), store: new Set() };
      rows.forEach((r) => next[r.item_type].add(r.item_id));
      setIds(next);
    } catch {
      setIds({ menu: new Set(), store: new Set() });
    }
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load();
    } else {
      setIds({ menu: new Set(), store: new Set() });
    }
  }, [user, load]);

  const toggle = useCallback(
    async (type: "menu" | "store", id: number) => {
      if (!user) return openAuth("login");
      if (ids[type].has(id)) await api(`/api/wishlist/${type}/${id}`, { method: "DELETE" });
      else await api("/api/wishlist", { method: "POST", json: { item_type: type, item_id: id } });
      await load();
    },
    [user, ids, openAuth, load]
  );

  return { ids, toggle };
}

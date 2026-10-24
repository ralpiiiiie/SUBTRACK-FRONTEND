import { useEffect, useState } from "react";
import { getCatalog } from "@/services/subscriptionService";
import type { CatalogMeta } from "@/types/subscription";

let cached: CatalogMeta | null = null;
let inflight: Promise<CatalogMeta | null> | null = null;

export function useCatalog(): CatalogMeta | null {
  const [meta, setMeta] = useState<CatalogMeta | null>(cached);

  useEffect(() => {
    let active = true;

    if (!cached && !inflight) {
      inflight = getCatalog()
        .then((result) => {
          cached = result;
          return result;
        })
        .catch(() => {
          inflight = null;
          return null;
        });
    }

    inflight?.then((result) => {
      if (active && result) setMeta(result);
    });

    return () => {
      active = false;
    };
  }, []);

  return meta;
}
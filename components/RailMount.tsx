"use client";
import { useEffect } from "react";
import type { RailItem } from "@/lib/patch-rail";

/** Starts the 3D patch rail on the home page (three.js loads only here). */
export default function RailMount({ items, start }: { items: RailItem[]; start: number }) {
  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    const main = document.getElementById("main");
    if (!main?.querySelector(".stage")) return;
    import("@/lib/patch-rail").then(({ mountRail }) => {
      if (!cancelled) stop = mountRail(main, items, start);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [items, start]);
  return null;
}

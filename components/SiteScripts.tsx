"use client";
import { useEffect } from "react";
import { enhanceHeader, enhanceQuoteForms } from "@/lib/enhance";

type Groups = Parameters<typeof enhanceHeader>[0];

/** Header menus and quote-form sending, on every page. */
export default function SiteScripts({ groups, email }: { groups: Groups; email: string }) {
  useEffect(() => {
    const a = enhanceHeader(groups);
    const b = enhanceQuoteForms(email);
    return () => {
      a();
      b();
    };
  }, [groups, email]);
  return null;
}

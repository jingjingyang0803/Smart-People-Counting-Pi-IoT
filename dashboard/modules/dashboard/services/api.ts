import type { Payload } from "../types";

export const MOCK_FILES = [
  { label: "sample_1.json (normal)", path: "/data/mock/sample_1.json" },
  { label: "sample_2.json (group in)", path: "/data/mock/sample_2.json" },
  { label: "sample_empty.json (empty)", path: "/data/mock/sample_empty.json" },
  { label: "sample_busy.json (busy)", path: "/data/mock/sample_busy.json" },
  {
    label: "sample_over.json (over capacity)",
    path: "/data/mock/sample_over.json",
  },
] as const;

export async function fetchPayload(path: string): Promise<Payload> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path} (HTTP ${res.status})`);
  return (await res.json()) as Payload;
}

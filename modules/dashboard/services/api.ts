import type { Payload } from "../types";

export const MOCK_FILES = [
  { label: "sample_1.json", path: "/data/mock/sample_1.json" },
  { label: "sample_2.json", path: "/data/mock/sample_2.json" },
] as const;

export async function fetchPayload(path: string): Promise<Payload> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${path} (HTTP ${res.status})`);
  return (await res.json()) as Payload;
}

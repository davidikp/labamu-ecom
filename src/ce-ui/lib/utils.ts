export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Normalize test ids: use fallback when omitted, convert hyphens to underscores. */
export function toTestId(id: string | undefined, fallback: string): string {
  return (id ?? fallback).replaceAll("-", "_");
}


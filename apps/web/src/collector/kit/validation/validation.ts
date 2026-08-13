export interface ValidationIssue {
  path: string;
  message: string;
}

export function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

export function formatPath(...parts: (string | number)[]): string {
  return parts.join(" · ");
}

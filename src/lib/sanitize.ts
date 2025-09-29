import DOMPurify from "isomorphic-dompurify";

DOMPurify.setConfig({
  USE_PROFILES: { html: true },
});

export function sanitizeHtml(value: string): string {
  return DOMPurify.sanitize(value);
}

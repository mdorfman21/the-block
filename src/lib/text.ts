/** `"clean"` → `"Clean"`. Capitalizes the first character only. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

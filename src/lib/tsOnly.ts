/**
 * Tracks whose cards are TypeScript-only topics: they always run in strict TS mode and the JS/TS
 * toggle is locked. Every other card supports both JavaScript and TypeScript.
 * Keep scripts/report-ts.mjs (TS_ONLY_TRACKS) in sync with this list.
 */
export const TS_ONLY_TRACKS: readonly string[] = ['typescript-patterns'];

export function isTsOnlyCard(card: { track?: string } | null | undefined): boolean {
  return card?.track !== undefined && TS_ONLY_TRACKS.includes(card.track);
}

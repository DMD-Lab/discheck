// live-clears only; never swaps messages
export function revealError(
  committedValue: string,
  liveValue: string,
  committedError: string | null,
  liveError: string | null,
): string | null {
  if (committedError === null) return null
  if (liveError === null) return null
  if (committedValue.length === 0 && liveValue.length > 0) return null
  if (committedValue.length > 0 && liveValue.length === 0) return liveError
  return committedError
}

export function revealOwnError(
  committedValue: string,
  liveValue: string,
  getError: (value: string) => string | null,
): string | null {
  return revealError(committedValue, liveValue, getError(committedValue), getError(liveValue))
}

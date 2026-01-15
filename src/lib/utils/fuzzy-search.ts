/**
 * Fuzzy search utility for Hebrew text autocomplete
 */

/**
 * Search for items that match the query
 * Prioritizes items that start with the query, then includes items that contain it
 *
 * @param query - Search query string
 * @param items - Array of items to search through
 * @param limit - Maximum number of results to return (default: 8)
 * @returns Array of matching items, sorted by relevance
 */
export function fuzzySearchHebrew(
  query: string,
  items: string[],
  limit = 8
): string[] {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  // Normalize query for comparison
  const normalizedQuery = trimmedQuery.toLowerCase()

  // Separate into "starts with" and "contains" matches for better relevance
  const startsWithMatches: string[] = []
  const containsMatches: string[] = []

  for (const item of items) {
    const normalizedItem = item.toLowerCase()

    if (normalizedItem.startsWith(normalizedQuery)) {
      startsWithMatches.push(item)
    } else if (normalizedItem.includes(normalizedQuery)) {
      containsMatches.push(item)
    }
  }

  // Combine results: "starts with" matches first, then "contains" matches
  return [...startsWithMatches, ...containsMatches].slice(0, limit)
}

/**
 * Filter out items that are already in the existing list
 *
 * @param suggestions - Array of suggestions
 * @param existingItems - Array of existing item names to exclude
 * @returns Filtered suggestions without duplicates
 */
export function filterExistingItems(
  suggestions: string[],
  existingItems: string[]
): string[] {
  const existingSet = new Set(existingItems.map(item => item.toLowerCase()))
  return suggestions.filter(suggestion => !existingSet.has(suggestion.toLowerCase()))
}

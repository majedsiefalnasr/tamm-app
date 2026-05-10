/** Stable Sonner toast id for milestone-scoped mutations (replace duplicates). */
export function milestoneMutationToastId(
  action: string,
  milestoneId: string
): string {
  return `mutation:milestone:${action}:${milestoneId}`
}

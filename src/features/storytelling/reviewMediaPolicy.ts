/** This branch is a code review, not the final media-enabled release.
 * The published base already includes Apollo 15 and homepage recordings.
 * New mission originals stay outside this review, in private local inputs/worktrees.
 * This policy describes deliberate omissions, not network availability.
 */
export function isOmittedReviewRecording(src: string) {
  return /^\/audio\/(?:apollo-(?:11|16|17)|sojourner|opportunity|viking-1|ingenuity)\//.test(src)
}

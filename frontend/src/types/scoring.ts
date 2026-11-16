export function computeScore(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 10 * 100) / 100;
}

export function isPassed(bestScore: number, passScore: number): boolean {
  return bestScore >= passScore;
}

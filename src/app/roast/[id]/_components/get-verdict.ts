export type Severity = 'critical' | 'warning' | 'good'

export function getVerdict(score: number): {
  label: string
  severity: Severity
} {
  if (score <= 4)
    return { label: 'verdict: needs_serious_help', severity: 'critical' }
  if (score <= 6)
    return { label: 'verdict: needs_improvement', severity: 'warning' }
  if (score <= 8) return { label: 'verdict: acceptable', severity: 'warning' }
  return { label: 'verdict: pretty_good', severity: 'good' }
}

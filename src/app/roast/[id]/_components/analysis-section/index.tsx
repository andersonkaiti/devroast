'use client'

import { AnalysisCard, Badge } from '@components/ui'
import type { Severity } from '../get-verdict'
import { SectionTitle } from '../section-title'

export interface Finding {
  severity: Severity
  title: string
  description: string
}

interface AnalysisSectionProps {
  findings: Finding[]
}

export function AnalysisSection({ findings }: AnalysisSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <SectionTitle>detailed_analysis</SectionTitle>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {findings.map((finding) => (
          <AnalysisCard key={finding.title}>
            <Badge severity={finding.severity}>{finding.severity}</Badge>
            <AnalysisCard.Title>{finding.title}</AnalysisCard.Title>
            <AnalysisCard.Description>
              {finding.description}
            </AnalysisCard.Description>
          </AnalysisCard>
        ))}
      </div>
    </section>
  )
}

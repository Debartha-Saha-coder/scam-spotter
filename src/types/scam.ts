export type FindingCategory = 'high' | 'caution' | 'info'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface MatchSpan {
  start: number
  end: number
  text: string
}

export interface Finding {
  id: string
  name: string
  category: FindingCategory
  points: number
  explanation: string
  recommendation: string
  matches: MatchSpan[]
}

export interface AnalysisResult {
  score: number
  risk: RiskLevel
  findings: Finding[]
  nextSteps: string[]
  message: string
}

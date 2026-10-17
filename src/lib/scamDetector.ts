import type { AnalysisResult, Finding, FindingCategory, MatchSpan, RiskLevel } from '../types/scam'

interface Rule {
  id: string
  name: string
  category: FindingCategory
  points: number
  explanation: string
  recommendation: string
  patterns: RegExp[]
}

const rules: Rule[] = [
  {
    id: 'urgency',
    name: 'Pressure to act quickly',
    category: 'caution',
    points: 20,
    explanation: 'Scammers use deadlines and urgency to stop people from checking a request carefully.',
    recommendation: 'Pause. Verify the request through an independently opened official app or website.',
    patterns: [/\b(?:act\s+immediately|urgent(?:\s+action)?\s+required|within\s+(?:\d+\s+)?(?:hours?|minutes?|24\s+hours)|today\s+only|verify\s+now|immediate(?:ly)?|expires?\s+(?:today|soon|in\s+\d+))\b/gi],
  },
  {
    id: 'threat',
    name: 'Threat or account restriction',
    category: 'high',
    points: 15,
    explanation: 'Threats of suspension, blocking, legal action, or termination are often used to frighten recipients into compliance.',
    recommendation: 'Contact the organization using a trusted number or its official app, not message-provided details.',
    patterns: [/\b(?:your\s+)?account\s+(?:will\s+be\s+)?(?:blocked|suspended|closed|restricted|locked|disabled)\b/gi, /\b(?:legal\s+action|service\s+will\s+be\s+terminated|final\s+warning)\b/gi],
  },
  {
    id: 'otp',
    name: 'Verification code requested',
    category: 'high',
    points: 40,
    explanation: 'A one-time code can authorize access or a transaction. Legitimate support staff should not ask you to tell them this code.',
    recommendation: 'Never share an OTP or verification code. If you already shared one, contact the relevant service or bank immediately.',
    patterns: [/\b(?:share|send|tell(?:\s+us)?|provide|give(?:\s+us)?|forward|reply\s+with|enter|submit)\s+(?:us\s+)?(?:your\s+)?(?:(?:one[- ]time|verification|security)\s+)?(?:otp|passcode|verification\s+code|security\s+code)\b/gi, /\b(?:we\s+need|send\s+us|provide\s+us\s+with)\s+(?:your\s+)?(?:otp|verification\s+code|one[- ]time\s+password)\b/gi],
  },
  {
    id: 'credentials',
    name: 'Password or PIN requested',
    category: 'high',
    points: 35,
    explanation: 'Requests to send passwords, PINs, or banking credentials can give someone direct access to accounts.',
    recommendation: 'Do not provide passwords or PINs in a message or through a message link.',
    patterns: [/\b(?:send|share|tell(?:\s+us)?|provide|enter|reply\s+with)\s+(?:us\s+)?(?:your\s+)?(?:password|pin|banking credentials|login details|account credentials)\b/gi, /\b(?:enter|submit)\s+your\s+(?:banking\s+)?(?:password|pin|credentials)\b/gi],
  },
  {
    id: 'link',
    name: 'Link included — verify independently',
    category: 'caution',
    points: 8,
    explanation: 'A link in a message is not proof of a scam, but it can lead to a lookalike sign-in or payment page. This tool cannot verify a website’s safety.',
    recommendation: 'Avoid opening unexpected links. Navigate to the organization’s known official website or app yourself.',
    patterns: [/\b(?:https?:\/\/|www\.)[^\s<>"']+/gi, /\b[a-z0-9][a-z0-9-]*\.(?:com|net|org|in|co|io|info|biz|xyz|top|site|app)(?:\/[^\s<>"']*)?/gi],
  },
  {
    id: 'url-risk',
    name: 'URL has a cautionary feature',
    category: 'high',
    points: 17,
    explanation: 'Shortened links, raw IP addresses, non-encrypted HTTP, and lookalike-style domains can make a destination harder to check. This is a heuristic, not a verdict about the site.',
    recommendation: 'Do not follow the link from the message. Find the organization’s official contact route independently.',
    patterns: [/\bhttps?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s<>"']*)?/gi, /\bhttps?:\/\/(?:www\.)?(?:bit\.ly|tinyurl\.com|t\.co|cutt\.ly|rb\.gy|is\.gd|ow\.ly|shorturl\.at)\b[^\s<>"']*/gi, /\bhttp:\/\/[^\s<>"']+/gi, /\bhttps?:\/\/[^\s/]*xn--[^\s/]*/gi, /\bhttps?:\/\/[a-z0-9.-]*(?:verify|secure|account|bank|login|update)[a-z0-9.-]*\.(?:com|net|org|in|co|io|info|biz|xyz|top|site|app)(?:\/[^\s<>"']*)?/gi],
  },
  {
    id: 'payment',
    name: 'Unexpected payment pressure',
    category: 'caution',
    points: 20,
    explanation: 'Unexpected fees, advance payments, or urgent transfers can be used to collect money before a claim is verified.',
    recommendation: 'Do not pay through the message. Check the charge through an independently accessed official service.',
    patterns: [/\b(?:pay|payment|transfer|send)\s+(?:a\s+)?(?:small\s+)?(?:delivery\s+)?(?:fee|charge|amount|money|funds)\b/gi, /\b(?:advance\s+payment|pay\s+now|payment\s+required|pay\s+to\s+(?:avoid|prevent|unlock|release)|transfer\s+(?:the\s+)?money)\b/gi],
  },
  {
    id: 'impersonation',
    name: 'Organization claim paired with pressure',
    category: 'caution',
    points: 12,
    explanation: 'The message names a trusted organization and also asks for sensitive action or applies pressure. Text alone cannot confirm who sent it.',
    recommendation: 'Check the claim with the organization using contact details from its official site or app.',
    patterns: [/\b(?:bank|government|tax department|police|college|university|courier|delivery service|postal service|income tax)\b/gi],
  },
  {
    id: 'prize',
    name: 'Unexpected prize or reward',
    category: 'caution',
    points: 22,
    explanation: 'Unexpected wins and rewards that require a fee or personal details are common scam approaches.',
    recommendation: 'Do not pay to claim an unexpected prize. Verify any promotion through the organization’s official channel.',
    patterns: [/\b(?:you(?:'|’)ve|you have)\s+won\b|\b(?:lottery|prize|reward|giveaway)\b/gi],
  },
  {
    id: 'personal-info',
    name: 'Sensitive information requested',
    category: 'high',
    points: 22,
    explanation: 'A request for identity, banking, or card details can expose you to identity theft or financial loss.',
    recommendation: 'Do not send personal or financial details in response. Verify the request through a trusted channel.',
    patterns: [/\b(?:send|share|provide|submit|confirm|update|enter)\s+(?:your\s+)?(?:social security|aadhaar|identity|id|card|cvv|bank account|account number|date of birth|personal|financial)\s+(?:number|details|information|data)?\b/gi],
  },
  {
    id: 'sender',
    name: 'Sender details are not verifiable here',
    category: 'info',
    points: 0,
    explanation: 'The message contains a contact detail or asks you to contact a supplied number or address. This app cannot authenticate senders or phone numbers.',
    recommendation: 'Do not rely on contact details in an unexpected message. Look up the organization’s contact details independently.',
    patterns: [/\b(?:call|contact|whatsapp|text|reply)\s+(?:us\s+)?(?:at|on|to)\s+(?:\+?\d[\d\s().-]{5,}\d|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi, /\b(?:from|sender)\s*:\s*(?:\+?\d[\d\s().-]{5,}\d|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi],
  },
]

const NEGATED_REQUEST = /(?:\bnever(?:\s+ever)?|\bdon['’]t(?:\s+ever)?|\bdo not|\bdont|\bavoid|\bnot to|\bwithout)\s+(?:you\s+should\s+|please\s+)?(?:your\s+|us\s+|you\s+|the\s+|a\s+|an\s+){0,2}$/i
const EDUCATIONAL_CONTEXT = /\b(?:example|training|awareness|educational)\b[^.!?\n]{0,80}$/i

function isNegated(text: string, start: number): boolean {
  const prefix = text.slice(Math.max(0, start - 80), start)
  return NEGATED_REQUEST.test(prefix) || EDUCATIONAL_CONTEXT.test(prefix)
}

function collectMatches(text: string, rule: Rule): MatchSpan[] {
  const found: MatchSpan[] = []
  for (const pattern of rule.patterns) {
    pattern.lastIndex = 0
    for (const match of text.matchAll(pattern)) {
      const start = match.index
      if (start === undefined || isNegated(text, start)) continue
      const matchedText = match[0].replace(/[.,!?;:)]+$/, '')
      const end = start + matchedText.length
      if (end > start && !found.some((span) => span.start === start && span.end === end)) {
        found.push({ start, end, text: text.slice(start, end) })
      }
    }
  }
  return found.sort((a, b) => a.start - b.start || a.end - b.end)
}

function riskFor(score: number): RiskLevel {
  if (score >= 60) return 'HIGH'
  if (score >= 30) return 'MEDIUM'
  return 'LOW'
}

function makeNextSteps(findings: Finding[]): string[] {
  const ids = new Set(findings.map((finding) => finding.id))
  const steps: string[] = []
  if (ids.has('otp') || ids.has('credentials') || ids.has('personal-info')) {
    steps.push('Never share OTPs, PINs, passwords, or financial details with someone who contacts you unexpectedly.')
  }
  if (ids.has('link') || ids.has('url-risk')) {
    steps.push('Do not click unexpected links or download attachments. Open the official app or type a known website address yourself.')
  }
  if (ids.has('payment') || ids.has('threat') || ids.has('impersonation')) {
    steps.push('Verify claims with the organization using a trusted number or independently found contact channel.')
  }
  if (ids.has('prize')) {
    steps.push('Do not pay a fee or share personal details to unlock an unexpected prize.')
  }
  steps.push('If you already shared financial information, contact your bank or payment provider immediately.')
  if (ids.size > 0) {
    steps.push('In India, report suspected cybercrime at cybercrime.gov.in or call 1930 where applicable.')
  }
  return [...new Set(steps)]
}

export function analyzeMessage(message: string): AnalysisResult {
  const findings: Finding[] = []
  for (const rule of rules) {
    const matches = collectMatches(message, rule)
    if (matches.length === 0) continue

    if (rule.id === 'impersonation') {
      const contextualRequest = /\b(?:otp|one[- ]time|password|pin|fee|payment|pay|blocked|suspended|verify\s+now|click\s+here|link|urgent\s+action|immediately|within\s+\d+\s+(?:hours?|minutes?)|legal\s+action|terminate|share|send|provide|submit|enter|unlock)\b/i.test(message)
      if (!contextualRequest) continue
    }
    if (rule.id === 'prize' && !/\b(?:won|winner|claim|unlock|fee|pay|reward|prize|lottery)\b/i.test(message)) continue

    let points = rule.points
    if (rule.id === 'url-risk') points = 17
    findings.push({ id: rule.id, name: rule.name, category: rule.category, points, explanation: rule.explanation, recommendation: rule.recommendation, matches })
  }

  const riskyUrlMatches = findings.find((finding) => finding.id === 'url-risk')?.matches ?? []
  const genericLinks = findings.find((finding) => finding.id === 'link')
  if (genericLinks && genericLinks.matches.every((link) => riskyUrlMatches.some((risk) => link.start < risk.end && link.end > risk.start))) {
    genericLinks.points = 0
  }

  const score = Math.min(100, findings.reduce((total, finding) => total + finding.points, 0))
  return {
    score,
    risk: riskFor(score),
    findings,
    nextSteps: makeNextSteps(findings),
    message: findings.length === 0
      ? 'No obvious warning signs were detected by our current rules. This does not guarantee that the message is safe.'
      : '',
  }
}

export function getHighlightSegments(message: string, findings: Finding[]): Array<{ text: string; findingIds: string[] }> {
  const spans = findings.flatMap((finding) => finding.matches.map((match) => ({
    start: match.start,
    end: match.end,
    id: finding.id,
    priority: finding.category === 'high' ? 3 : finding.category === 'caution' ? 2 : 1,
  }))).sort((a, b) => a.start - b.start || b.priority - a.priority)

  const points = new Set<number>([0, message.length])
  spans.forEach((span) => { points.add(span.start); points.add(span.end) })
  const boundaries = [...points].sort((a, b) => a - b)
  const segments: Array<{ text: string; findingIds: string[] }> = []
  for (let i = 0; i < boundaries.length - 1; i += 1) {
    const start = boundaries[i]
    const end = boundaries[i + 1]
    if (start === undefined || end === undefined || end <= start) continue
    const active = spans.filter((span) => span.start < end && span.end > start)
    const ids = [...new Set(active.sort((a, b) => b.priority - a.priority).map((span) => span.id))]
    const last = segments[segments.length - 1]
    if (last && last.findingIds.join('|') === ids.join('|')) last.text += message.slice(start, end)
    else segments.push({ text: message.slice(start, end), findingIds: ids })
  }
  return segments
}
